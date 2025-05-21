// server.js
const express = require("express")
const fs = require("fs")
const cors = require("cors")
const app = express()
const PORT = process.env.PORT || 3000

const SCORES_FILE = "./scores.json"

app.use(cors())
app.use(express.json())

// Helper: Load scores from file
function loadScores() {
  try {
    return JSON.parse(fs.readFileSync(SCORES_FILE, "utf8"))
  } catch {
    return []
  }
}

// Helper: Save scores to file
function saveScores(scores) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2))
}

// GET /scores - return all scores
app.get("/scores", (req, res) => {
  const scores = loadScores()
  res.json(scores)
})

// POST /scores - add a new score
app.post("/scores", (req, res) => {
  const { name, score, timestamp } = req.body
  if (
    typeof name !== "string" ||
    typeof score !== "number" ||
    !isFinite(score)
  ) {
    return res.status(400).json({ error: "Invalid score data" })
  }
  const scores = loadScores()
  scores.push({ name, score, timestamp: timestamp || new Date().toISOString() })
  // Keep only top 100 scores
  scores.sort((a, b) => b.score - a.score)
  saveScores(scores.slice(0, 100))
  res.json({ success: true })
})

// Start server
app.listen(PORT, () => {
  console.log(`Leaderboard API running on port ${PORT}`)
  // Ensure scores file exists
  if (!fs.existsSync(SCORES_FILE)) saveScores([])
})[]