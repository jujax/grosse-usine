const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");

const DB_URI = "mongodb://localhost:27017/mydatabase";
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection error:", err));

// Schémas
const userSchema = new mongoose.Schema({
  _id: {
    type: String, // Le champ _id sera une chaîne
    default: uuidv4, // Générer un UUID par défaut si non fourni
  },
  email: String,
  avatar: String,
  friends: [{ type: String, ref: "User" }],
}, { collection: "User" });

const workSchema = new mongoose.Schema({
  title: String,
  type: String,
  genre: [String],
  releaseDate: Date,
  rating: Number,
  votesCount: Number,
}, { collection: "Work" });

const reviewSchema = new mongoose.Schema({
  userId: { type: String, ref: "User" },
  workId: { type: String, ref: "Work" },
  rating: Number,
  reviewText: String,
  date: Date,
}, { collection: "Review" });

const commentSchema = new mongoose.Schema({
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  commentText: String,
  date: Date,
});

// Modèles
const User = mongoose.model("User", userSchema);
const Work = mongoose.model("Work", workSchema);
const Review = mongoose.model("Review", reviewSchema);
const Comment = mongoose.model("Comment", commentSchema);

// Paramètres
const BATCH_SIZE = 10000;
const NB_USERS = 1000000;
const NB_WORKS = 100000;
const NB_REVIEWS = 1000000;
const NB_COMMENTS = 1000000;

// Utilitaires
async function insertInBatches(model, data, batchSize) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await model.insertMany(batch);
    console.log(
      `Inserted ${batch.length} into ${model.collection.collectionName}`
    );
  }
}

// Génération des utilisateurs
async function generateUsers() {
  console.log("Generating users...");
  for (let i = 0; i < NB_USERS / BATCH_SIZE; i++) {
    const users = Array.from({ length: BATCH_SIZE }, () => ({
      email: faker.internet.email(),
      password: faker.internet.password(),
      avatar: faker.image.avatar(),
      friends: [],
    }));
    await User.insertMany(users);
    console.log(`Inserted batch ${i + 1}/${NB_USERS / BATCH_SIZE} users`);
  }
  console.log("Users generation complete!");
}

// Ajout d'amis bidirectionnels
async function addFriends() {
  console.log("Adding friends...");
  const allUsers = await getXPercentOfModel(User);
  const userIds = allUsers.map(user => user._id);

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batchIds = userIds.slice(i, i + BATCH_SIZE);
    for (const userId of batchIds) {
      const numberOfFriends = faker.number.int({ min: 1, max: 5 });
      const randomFriends = faker.helpers.arrayElements(
        userIds,
        numberOfFriends
      );

      for (const friendId of randomFriends) {
        if (friendId.toString() !== userId.toString()) {
          await User.updateOne(
            { _id: userId },
            { $addToSet: { friends: friendId } }
          );
          await User.updateOne(
            { _id: friendId },
            { $addToSet: { friends: userId } }
          );
        }
      }
    }
    console.log(`Processed friends for batch ${i / BATCH_SIZE + 1}`);
  }
  console.log("Friends added!");
}

async function getXPercentOfModel(model, percent = 10) {
    const totalOfDocs = await model.countDocuments(); // Nombre total d'utilisateurs
    const tenPercent = Math.floor(totalOfDocs * (percent / 100)); // Calculer 10 %
    const allDocs = await model.find({}, "_id").limit(tenPercent).lean();
    return allDocs;
}

// Génération des œuvres
async function generateWorks() {
  console.log("Generating works...");
  const types = ["Film", "Livre", "Jeu", "Série", "Musique"];
  const works = Array.from({ length: NB_WORKS }, () => ({
    title: faker.commerce.productName(),
    type: faker.helpers.arrayElement(types),
    genre: faker.helpers.arrayElements(
      ["Aventure", "SF", "Comédie", "Action", "Drame"],
      2
    ),
    releaseDate: faker.date.past(30),
    rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
    votesCount: faker.number.int({ min: 1, max: 1000 }),
  }));
  await insertInBatches(Work, works, BATCH_SIZE);
  console.log("Works generation complete!");
}

// Génération des critiques
async function generateReviews() {
  console.log("Generating reviews...");
  const users = await getXPercentOfModel(User);
  const works = await getXPercentOfModel(Work);
  const userIds = users.map(user => user._id);
  const workIds = works.map(work => work._id);

  const reviews = Array.from({ length: NB_REVIEWS }, () => ({
    userId: faker.helpers.arrayElement(userIds),
    workId: faker.helpers.arrayElement(workIds),
    rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
    reviewText: faker.lorem.sentences(3),
    date: faker.date.recent(100),
  }));
  await insertInBatches(Review, reviews, BATCH_SIZE);
  console.log("Reviews generation complete!");
}

// Génération des commentaires
async function generateComments() {
  console.log("Generating comments...");
  const users = await getXPercentOfModel(User);
  const reviews = await getXPercentOfModel(Review);
  const userIds = users.map(user => user._id);
  const reviewIds = reviews.map(review => review._id);

  const comments = Array.from({ length: NB_COMMENTS }, () => ({
    reviewId: faker.helpers.arrayElement(reviewIds),
    userId: faker.helpers.arrayElement(userIds),
    commentText: faker.lorem.sentences(2),
    date: faker.date.recent(50),
  }));
  await insertInBatches(Comment, comments, BATCH_SIZE);
  console.log("Comments generation complete!");
}

// Exécuter le script
async function run() {
    // await generateUsers();
    await addFriends();
  // await generateWorks();
  // await generateReviews();
  // await generateComments();
  console.log("Data generation complete!");
  mongoose.disconnect();
}

run().catch(err => console.error(err));
