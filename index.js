const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@mrn.gtqnz.mongodb.net/?retryWrites=true&w=majority`;

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

        // Create a DateBase and Collections 
        const usersCollection = client.db("ninjaKungFuDb").collection("users");
        const classCollection = client.db("ninjaKungFuDb").collection("class");

        // users related apis [Get logged user data from database]
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // [Create a Login user api. and save user data server and database both]
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // create a admin [**Make Admin** ]
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };

            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })

        // create a instructor [**Make Instructor** ]
        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'instructor'
                },
            };

            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })

        // class related apis

        // **Add a Class:** 
        app.post('/class', async (req, res) => {
            const item = req.body;
            const result = await classCollection.insertOne(item);
            res.send(result);
        })

        // **My Classes: get only a instructor class**  
        app.get('/class', async (req, res) => {
            const email = req.query.email;
            const query = { instructorEmail: email };
            const result = await classCollection.find(query).toArray();
            res.send(result);
        })

        // **  Get all instructor class**  
        app.get('/all_class', async (req, res) => {
            const result = await classCollection.find().toArray();
            res.send(result);
        })

        // **My Classes Up Date:**  
        app.put('/class/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    className: body.className,
                    classImage : body.classImage,
                    instructorName : body.instructorName,
                    instructorEmail : body.instructorEmail,
                    availableSeats : body.availableSeats,
                    price:body.price
                },
            };

            const result = await classCollection.updateOne(filter, updateDoc,options);
            res.send(result);

        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Ninja Kung Fu Fusion Runnign')
})

app.listen(port, () => {
    console.log(`Ninja Kung Fu Fusion is Runnign on port ${port}`);
})


