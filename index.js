const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


require('dotenv').config();

const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://tech-insights-d2159.web.app',
    'https://tech-insights-d2159.firebaseapp.com',
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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
    await client.connect();

    const userCollection = client.db('techInsightsDB').collection('users');
    const publisherCollection = client.db('techInsightsDB').collection('publishers');


    // get all users
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    // get specific user
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      
      const result = await userCollection.findOne(query)
      res.send(result)
    })

    // create or update user
    app.put('/users', async (req, res) => {
      const user = req.body;

      const query = { email: user.email };
      const options = { upsert: true };

      // checking if the user exists already
      const existingUser = await userCollection.findOne(query);
     
      
      if (existingUser) {
        // if existing user try to change his role
        if (user.status === 'requested') {
          const result = await userCollection.updateOne(query, {
            $set: { status: 'requested'  },
          });
          return res.send(result);
        }

        // making admin
        if (user.role === 'admin') {
          const result = await userCollection.updateOne(query, { $set: { role: 'admin', status: 'verified', subscription: 'premium' } })
          return res.send(result)
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
             $set: { ...user },
           });
           return res.send(result);
        }

        return res.send({ message: 'User already exists', insertedId: null });
      }

      // saving the user data for the first time
      
      const updateDoc = {
        $set: {
          ...user
        },
      }
      const result = await userCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })

    // updating user profile
    app.patch('/users/:email', async (req, res) => {
      const updatedUserInfo = req.body;
      const email = req.params.email;

      const filter = { email }
      const updateDoc = {
        $set: {...updatedUserInfo}
      }

      try {
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error(error)
      }
    })

    // get all the publisher
    app.get('/publishers', async (req, res) => {
      const result = await publisherCollection.find().toArray();
      res.send(result)
    })

    // create publisher
    app.post('/publishers', async (req, res) => {
      const publisherData = req.body;

      const result = await publisherCollection.insertOne(publisherData)
      return res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
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
