require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://tech-insights-d2159.web.app',
    'https://tech-insights-d2159.firebaseapp.com',
  ],
  // credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4qgkjzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const uri = 'mongodb://localhost:27017';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db('techInsightsDB').collection('users');
    const publisherCollection = client
      .db('techInsightsDB')
      .collection('publishers');
    const articleCollection = client
      .db('techInsightsDB')
      .collection('articles');
    const messageCollection = client
      .db('techInsightsDB')
      .collection('messages');
    const paymentCollection = client
      .db('techInsightsDB')
      .collection('payments');

    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '7d',
      });
      res.send({ token });
    });

    // middlewares
    const verifyToken = (req, res, next) => {
      // console.log('inside verify token', req.headers.authorization);

      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }

      const token = req.headers.authorization.split(' ')[1];

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          console.log('JWT verification error:', err);
          return res.status(401).send({ message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
      });
    };

    // verify admin middleware
    const verifyAdmin = async (req, res, next) => {
      const user = req.decoded;

      const query = { email: user?.email };
      const result = await userCollection.findOne(query);

      if (!result || result?.role !== 'admin')
        return res.status(401).send({ message: 'unauthorized access!!' });

      next();
    };

    // get all users
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (error) {
        return res.send(error);
      }
    });

    // get specific user
    app.get('/users/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;

        const query = { email: email };

        const result = await userCollection.findOne(query);

        return res.send(result);
      } catch (error) {
        return res.send(error);
      }
    });

    // create or update user
    app.put('/users', async (req, res) => {
      const user = req.body;

      console.log(user)
      

      const query = { email: user.email };
      const options = { upsert: true };

      // checking if the user exists already
      const existingUser = await userCollection.findOne(query);

      try {
        if (existingUser) {
          // if existing user try to change his role
          if (user.status === 'requested') {
            const result = await userCollection.updateOne(query, {
              $set: { status: 'requested' },
            });
            return res.send(result);
          }

          // making admin
          if (user.role === 'admin') {
            const result = await userCollection.updateOne(query, {
              $set: {
                role: 'admin',
                status: 'verified',
                subscription: 'premium',
              },
            });
            return res.send(result);
          }

          // remove admin
          if (user.status === 'remove-admin') {
            const result = await userCollection.updateOne(query, {
              $set: {
                status: 'verified',
                role: 'user',
                subscription: 'usual',
              },
            });
            return res.send(result);
          }          

          // if existing user try to buy subscription
          if (user.subscription === 'premium') {
            const result = await userCollection.updateOne(query, {
              $set: {
                subscription: 'premium',
                premiumToken:
                  Math.floor(new Date().getTime() / 1000) + user.validationTime,
              },
            });
            return res.send(result);
          }

          return res.send({
            message: 'User already exists',
            insertedId: null,
          });
        }

        // saving the user data for the first time

        const updateDoc = {
          $set: {
            ...user,
          },
        };
        const result = await userCollection.updateOne(
          query,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        return res.send(error);
      }
    });

    // dynamically check user subscription
    cron.schedule('* * * * *', async (req, res) => {
      try {
        const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000);

        const filter = {
          subscription: 'premium',
          premiumToken: { $lt: currentTimeInSeconds },
        };

        const expiredUsers = await userCollection.find(filter).toArray();

        // Update all expired users to "regular"
        if (expiredUsers.length > 0) {
          const updatedDoc = {
            $set: { subscription: 'usual', premiumToken: null },
          };

          await userCollection.updateMany(filter, updatedDoc);
          console.log(`${expiredUsers.length} users downgraded to usual`);
        }
      } catch (error) {
        console.error('Error downgrading subscriptions:', error);
      }
    });

    // get admin stat
    app.get('/admin-stats', verifyToken, verifyAdmin, async (req, res) => {
      const totalUsers = await userCollection.countDocuments();

      const totalArticles = await articleCollection.countDocuments();

      const totalPublishers = await publisherCollection.countDocuments();

      // const revenue = payments.reduce((total, payment) => total + payment.price, 0);

      // const articles = await articleCollection.find().toArray()

      // const totalViews = articles.reduce((views, article) => views + article.view_count ,0)

      // get article collection
      const result = await articleCollection.aggregate([
        {
          $group: {
            _id: null,
            totalViews : {$sum: '$view_count'}
        }}
      ]).next()

// get articles by publishers
      const articleByPublisher = await articleCollection.aggregate([
        {
          $group: {
            _id: '$publisher',
            count: { $sum: 1 }
          },
        },
        {
          $project: {
            publisher: '$_id',
            count: 1,
            _id: 0
          }
        }
        
      ]).toArray()

      // get subscription count
      const subscriptionCount = await userCollection
        .aggregate([
          {
            $group: {
              _id: '$subscription',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              subscriptionType: '$_id',
              count: 1,
              _id: 0,
            },
          },
        ])
        .toArray();

      const publishedArticle = await articleCollection.countDocuments({status: 'approved'})

      const totalViews = result ? result.totalViews : 0;

      res.send({ totalUsers, totalArticles, totalPublishers, totalViews, publishedArticle, articleByPublisher, subscriptionCount });
    })

    // updating user profile
    app.patch('/users/:email', verifyToken, async (req, res) => {
      const updatedUserInfo = req.body;
      const email = req.params.email;

      const filter = { email };
      const updateDoc = {
        $set: { ...updatedUserInfo },
      };

      try {
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        return res.send(result);
      }
    });

    // get all the publisher
    app.get('/publishers', async (req, res) => {
      try {
        const result = await publisherCollection.find().toArray();
        res.send(result);
      } catch (error) {
        return res.send(error);
      }
    });

    // create publisher
    app.post('/publishers', verifyToken, verifyAdmin, async (req, res) => {
      try {
        const publisherData = req.body;

        const result = await publisherCollection.insertOne(publisherData);
        return res.send(result);
      } catch (error) {
        return res.send(error);
      }
    });

    // get all articles
    app.get('/articles', async (req, res) => {
      try {
        const result = await articleCollection.find().toArray();
        res.send(result);
      } catch (error) {
        return res.send(error.message);
      }
    });

    // get recent articles
    app.get('/recent-articles', async (req, res) => {
      try {
        const result = await articleCollection
          .find()
          .sort({ view_count: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    // get single article by id
    app.get('/articles/:id', verifyToken, async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      try {
        const result = await articleCollection.findOne(query);
        return res.send(result);
      } catch (error) {
        return res.send(error.message);
      }
    });

    // get articles by email
    app.get('/my-articles/:email', verifyToken, async (req, res) => {
      const email = req.params.email;

      const query = { writers_email: email };

      try {
        const result = await articleCollection.find(query).toArray();
        return res.send(result);
      } catch (error) {
        return res.send(error.message);
      }
    });

    // post a article
    app.post('/articles', verifyToken, async (req, res) => {
      try {
        const articleData = req.body;

        const result = await articleCollection.insertOne(articleData);

        return res.send(result);
      } catch (error) {
        return res.send(error);
      }
    });

    // update a article by admin
    app.put('/articles/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedInfo = req.body;

      // approve a post
      try {
        if (updatedInfo.status === 'approved') {
          const result = await articleCollection.updateOne(filter, {
            $set: { status: 'approved' },
          });
          res.send(result);
        }
      } catch (error) {
        res.send(error.message);
      }

      // decline a post
      try {
        if (updatedInfo.status === 'declined') {
          const result = await articleCollection.updateOne(filter, {
            $set: { status: 'declined' },
          });
          res.send(result);
        }
      } catch (error) {
        res.send(error.message);
      }

      // make premium
      try {
        if (updatedInfo.isPremium === 'yes') {
          const result = await articleCollection.updateOne(filter, {
            $set: { isPremium: 'yes' },
          });
          res.send(result);
        }
      } catch (error) {
        res.send(error.message);
      }
    });

    // update view count
    app.patch('/articles/:id/increment-view', async (req, res) => {
      const articleId = req.params.id;

      try {
        const result = await articleCollection.updateOne(
          { _id: new ObjectId(articleId) },
          { $inc: { view_count: 1 } }
        );

        return res.send(result);
      } catch (error) {
        return res
          .status(500)
          .send({ error: 'Failed to increment view count' });
      }
    });

    // update article
    app.patch('/update/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedUserInfo = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: { ...updatedUserInfo },
      };

      try {
        const result = await articleCollection.updateOne(filter, updatedDoc);
        return res.send(result);
      } catch (error) {
        return res.send(error.message);
      }
    });

    // delete a article
    app.delete('/articles/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await articleCollection.deleteOne(query);
      res.send(result);
    });

    // get single  message by id
    app.get('/message/:id', async (req, res) => {
      const id = req.params.id;
      const query = { articleId: id };

      try {
        const result = await messageCollection.findOne(query);
        return res.send(result);
      } catch (error) {
        return res.send(error.message);
      }
    });

    // save a decline message
    app.post('/message/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      
      const message = req.body;

      const query = { _id: new ObjectId(id) };

      const existingMessage = await messageCollection.findOne(query);

      if (!existingMessage) {
        try {
          const result = await messageCollection.insertOne(message);
          res.send(result);
        } catch (error) {
          res.send(error.message);
        }
      }
    });

    // stripe
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseFloat(price * 100);

      if (amount < 50) {
        return res.status(400).send({
          error: 'The amount must be at least 50 cents (0.50 USD).',
        });
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card'],
        });

        res.status(200).send({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        return res.status().send({ error: error.message });
      }
    });

    // save payment info in db
    // payment
    app.post('/payments', async (req, res) => {
      const payment = req.body;

      try {
        const paymentResult = await paymentCollection.insertOne(payment);

        res.status(200).send(paymentResult);
      } catch (error) {
        console.error(error)
      }
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    // console.log(
    //   'Pinged your deployment. You successfully connected to MongoDB!'
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('The-Tech-Insight server is running');
});

app.listen(port, () => {
  console.log('The-Tech-Insight server is running');
});
