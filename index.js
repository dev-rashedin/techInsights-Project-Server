import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();

import cors from 'cors';

import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

import jwt from 'jsonwebtoken';

const port = 5000;

import cron from 'node-cron';

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // specify the latest Stripe version you're using
});

import nodemailer from 'nodemailer';

// middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://tech-insights-d2159.web.app',
    'https://tech-insights-d2159.firebaseapp.com',
  ],
  // credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// send email
const sendEmail = (emailAddress, emailData) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.TRANSPORTER_Email,
      pass: process.env.TRANSPORTER_PASS,
    },
  });

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  const mailBody = {
    from: `"TechInsights" <${process.env.TRANSPORTER_EMAIL}>`, // sender address
    to: emailAddress, // list of receivers
    subject: emailData.subject, // Subject line
    html: emailData.message, // html body
  };

  const info = transporter.sendMail(mailBody, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email Sent ' + info.response);
    }
  });

  console.log('Message sent: %s', info.messageId);
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4qgkjzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const uri = 'mongodb://localhost:27017';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let client;

async function run() {
  if (!client) {
    // Create a new MongoClient if it doesn't exist
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
  }

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
    const langQuizCollection = client
      .db('techInsightsDB')
      .collection('voted-languages');
    const sectorQuizCollection = client
      .db('techInsightsDB')
      .collection('voted-sectors');

    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '7d',
      });
      res.send({ token });
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
      const result = await articleCollection
        .aggregate([
          {
            $group: {
              _id: null,
              totalViews: { $sum: '$view_count' },
            },
          },
        ])
        .next();

      // get articles by publishers
      const articleByPublisher = await articleCollection
        .aggregate([
          {
            $group: {
              _id: '$publisher',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              publisher: '$_id',
              count: 1,
              _id: 0,
            },
          },
        ])
        .toArray();

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

      const publishedArticle = await articleCollection.countDocuments({
        status: 'approved',
      });

      const totalViews = result ? result.totalViews : 0;

      res.send({
        totalUsers,
        totalArticles,
        totalPublishers,
        totalViews,
        publishedArticle,
        articleByPublisher,
        subscriptionCount,
      });
    });

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
    //     app.get('/articles', async (req, res) => {
    //       const page = parseInt(req.query.page) || 0;
    //       const size = parseInt(req.query.size) || 6;
    //       const status = req.query.status;
    //       const filter = req.query.filter;
    //       const search = req.query.search
    //       const sort = req.query.sort;

    //       let query = {
    //         // title: {$regex: search, $options: 'i'}
    //         title: {$regex: search, $options: 'i'}
    //       };

    //       if (status) {
    //         query.status = status;
    //       }
    //       if (filter) {
    //         query.publisher = filter
    //       }

    //       let options = {};

    //       if (sort) {
    //         options = { sort: {
    // posted_time: sort === 'asc' ? 1 : -1 } };
    //       }

    //      console.log(options)

    //       try {
    //         const result = await articleCollection
    //           .find(query, options)
    //           .skip(page * size)
    //           .limit(size)
    //           .toArray();

    //         res.send(result);
    //       } catch (error) {
    //         return res.send(error.message);
    //       }
    //     });

    app.get('/articles', async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 6;
      const status = req.query.status;
      const filter = req.query.filter;
      const search = req.query.search;
      const sort = req.query.sort;

      let query = {};

      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }
      if (status) {
        query.status = status;
      }
      if (filter) {
        query.publisher = filter;
      }

      try {
        const result = await articleCollection
          .aggregate([
            {
              $match: query,
            },
            {
              $addFields: {
                posted_time_as_date: {
                  $dateFromString: {
                    dateString: '$posted_time',
                    format: '%m/%d/%Y',
                    onError: 'Invalid Date',
                    onNull: 'No Date',
                  },
                },
              },
            },
            {
              $sort: { posted_time_as_date: sort === 'asc' ? 1 : -1 },
            },
            {
              $skip: page * size,
            },
            {
              $limit: size,
            },
          ])
          .toArray();

        res.status(200).send(result);
      } catch (error) {
        console.error('Error fetching articles:', error.message);
        res.status(500).send(error.message);
      }
    });

    // get article count
    app.get('/articleCount', async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;

      let query = {
        // title : {$regex: search, $options: 'i'}
        title: { $regex: search, $options: 'i' },
      };
      if (filter) query.publisher = filter;

      try {
        const allArticles = await articleCollection.countDocuments(query);
        const approvedArticles = await articleCollection.countDocuments({
          status: 'approved',
          ...query,
        });

        res.status(200).send({
          allArticles: allArticles,
          approvedArticles: approvedArticles,
        });
      } catch (error) {
        return res.status(500).send({ error: error.message });
      }
    });

    // get premium article
    app.get('/premium-articles', async (req, res) => {
      try {
        const result = await articleCollection
          .find({ isPremium: 'yes' })
          .toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error Fetching Data' });
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
    app.get('/articles/:id', async (req, res) => {
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
      console.log(id);

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

    // get vote count
    app.get('/lang-quiz', async (req, res) => {
      const totalVotes = await langQuizCollection.countDocuments();

      const languageVotes = await langQuizCollection
        .aggregate([
          {
            $group: {
              _id: '$votedLang',
              votes: { $sum: 1 },
            },
          },
          {
            $sort: { votes: -1 },
          },
          {
            $project: {
              _id: 0,
              language: '$_id',
              votes: 1,
            },
          },
        ])
        .toArray();

      res.status(200).send({ totalVotes, languageVotes });
    });

    // get a single users vote
    app.get('/lang-quiz/:email', async (req, res) => {
      const email = req.params.email;
      const result = await langQuizCollection.findOne({ voterEmail: email });

      res.send(result);
    });

    // post a lang quiz vote
    app.post('/lang-quiz', async (req, res) => {
      const voteInfo = req.body;
      const query = { voterEmail: voteInfo.voterEmail };

      const existingVote = await langQuizCollection.findOne(query);

      if (!existingVote) {
        const result = await langQuizCollection.insertOne(voteInfo);
        res.status(200).send(result);
      }
      res.send('You have already voted for this');
    });

    // get demanding sector vote count
    app.get('/demanding-sector', async (req, res) => {
      const totalVotes = await sectorQuizCollection.countDocuments();

      const demandingSectors = await sectorQuizCollection
        .aggregate([
          {
            $group: {
              _id: '$votedOption',
              votes: { $sum: 1 },
            },
          },
          {
            $sort: { votes: -1 },
          },
          {
            $project: {
              _id: 0,
              sector: '$_id',
              votes: 1,
            },
          },
        ])
        .toArray();

      res.status(200).send({ totalVotes, demandingSectors });
    });

    // get a single users vote
    app.get('/demanding-sector/:email', async (req, res) => {
      const email = req.params.email;
      const result = await sectorQuizCollection.findOne({ voterEmail: email });

      res.send(result);
    });

    // post a demanding sector vote
    app.post('/demanding-sector', async (req, res) => {
      const voteInfo = req.body;
      const query = { voterEmail: voteInfo.voterEmail };

      const existingVote = await sectorQuizCollection.findOne(query);

      if (!existingVote) {
        const result = await sectorQuizCollection.insertOne(voteInfo);
        res.status(200).send(result);
      }
      res.send('You have already voted for this');
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
        console.error(error);
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
  console.log(`The-Tech-Insight server is running on port: ${port}`);
});
