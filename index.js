const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1uswq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // first need to make a connection
    const gameCollection = client.db('gameDB').collection('game');
    const wishlist = client.db('gameDB').collection('wishlist');

    // 


    // mongodb theke ei data ta niye cilent ea pathabo
    app.get('/games', async (req, res) => {
      const cursor = gameCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // details ta dekhar jonno
    app.get('/games/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gameCollection.findOne(query);
      res.send(result);
    })

    // first data ta client theke eakhane pathate hobe
    app.post('/games', async (req, res) => {
      const newGames = req.body;
      newGames.rating = parseInt(newGames.rating);
      console.log(newGames);
      const result = await gameCollection.insertOne(newGames);
      res.send(result);
    })

    // Get user reviews
    app.get('/myReviews', async (req, res) => {
      const email = req.query.email; // User's email passed as query parameter
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const result = await gameCollection.find({ userEmail: email }).toArray();
      res.json(result);
    });

    // add to wishlist
    app.post('/wishlist', async(req, res)=> {
    const result = await wishlist.insertOne(req.body)
    res.send(result)
    })

    // data niye asar jonno wishlist theke
    app.get('/wishlist/:email', async(req, res) => {
      const email = req.params.email
      const result = await wishlist.find({userEmail:email}).toArray()
      res.send(result)
    })

    // for highest rating make first api
    app.get('/rating', async(req, res) => {
      const result = await gameCollection.find().sort({rating:1}).limit(6).toArray()
      res.send(result)
    })
    // delete review
    app.delete('/games/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await gameCollection.deleteOne(query);
      res.send(result);
    });

    // user related api make
   app.patch('/updateReview/:id', async(req, res) => {
    const filter = {_id: new ObjectId(req.params.id)}
    const { rating, gameTitle, gameCover, reviewDescription, publishingYear, genre} = req.body;
    const updateDoc = {
      $set: {
        rating:parseInt(rating), gameTitle, gameCover, reviewDescription, publishingYear, genre
      }
    }
    const result = await gameCollection.updateOne(filter, updateDoc)
    res.send(result)
   })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Games making server is running')
})

app.listen(port, () => {
  console.log(`Games server is running on port: ${port}`)
})