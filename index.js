import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();

import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const port = 5000;

import cron from 'node-cron';

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // specify the latest Stripe version you're using
});

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
