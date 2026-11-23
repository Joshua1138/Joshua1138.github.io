/* ==========================================================================
   CONTENT FILE — everything personal lives here.
   Edit this file to change text, skills, papers and songs. You never need
   to touch index.html / app.js / style.css to update the site.

   ========================================================================== */

window.SITE = {
  name: "Joshua Janssen",
  // Shown under your name in the hero.
  role: "Data Scientist // AI Researcher",
  location: "Netherlands",

  // Your "Stand" — the name of your persona on the site. Change freely.
  stand: {
    name: "「NEON RHAPSODY」",
    ability:
      "Turns raw, messy data into clean insight at the speed of light. " +
      "Weakness: deadlines that arrive before the coffee does.",
  },

  // Short intro paragraph.
  about:
    "In a city drowning in data, somebody has to read the noise. Fresh out of a Master's in " +
    "Cognitive Science & AI at Tilburg University, I'm jacking in as a data scientist next month. " +
    "I turn raw signals into something you can act on: birdsong, skeleton poses, spreadsheets " +
    "nobody dared open. Between training runs you'll find me over-tuning hyperparameters, " +
    "hunting for the one feature that explains everything, and curating playlists that are " +
    "far too long. Yare yare daze: the dataset was never clean, but the model will still ship.",

  links: {
    github: "https://github.com/Joshua1138",
    linkedin: "https://www.linkedin.com/in/joshuajanssen-",
    email: "", // optional, e.g. "you@example.com" — leave empty to hide
  },

  /* STAND STATS — drawn as the radar chart. Exactly 6 entries work best.
     Grade: A (best) → E. */
  stats: [
    { label: "Python", grade: "A" },
    { label: "Machine Learning", grade: "A" },
    { label: "NLP", grade: "B" },
    { label: "Data Analysis", grade: "A" },
    { label: "SQL", grade: "B" },
    { label: "Research", grade: "A" },
  ],

  // Extra skill chips under the chart.
  skills: [
    "Python", "PyTorch", "scikit-learn", "pandas", "Deep Learning",
    "Natural Language Processing", "Statistics", "SQL", "Git",
    "Data Visualization", "Academic Writing", "Dutch", "English",
  ],

  /* PAPERS */
  // Each entry: url can be a web link or a PDF in /papers. cta = button label.
  papers: [
    {
      title: "Watching Without Waiting: Real-Time Work-State Recognition for Collaborative Robots",
      authors: "Joshua Janssen",
      venue: "MSc thesis, Cognitive Science & AI, Tilburg University",
      year: "2026",
      url: "papers/watching-without-waiting-msc-thesis.pdf",
      cta: "OPEN THESIS PDF",
      blurb:
        "A causal, past-only MS-TCN recognises busy, in-between and idle work states from a single " +
        "overhead camera in real time, reaching 74.9% frame accuracy on IKEA furniture assembly, " +
        "within a point of the model that sees the future.",
      tag: "MSC THESIS",
    },
    {
      title: "Comparative Analysis of Machine Learning Algorithms for Fake News Detection",
      authors: "Joshua Janssen",
      venue: "BSc thesis, Cognitive Science & AI, Tilburg University",
      year: "2024",
      url: "papers/fake-news-detection-bsc-thesis.pdf",
      cta: "OPEN THESIS PDF",
      blurb:
        "Naive Bayes, logistic regression, SVM and LSTM-based networks compared on about 76,500 " +
        "real and fake news articles: the SVM won with 94% accuracy, ahead of logistic regression " +
        "and the best deep model (both 91%).",
      tag: "BSC THESIS",
    },
    {
      title: "Auto deep learning for bioacoustic signals",
      authors: "Giulio Tosato, Abdelrahman Shehata, Joshua Janssen, Kees Kamp, Pramatya Jati, Dan Stowell",
      venue: "arXiv preprint (cs.LG), Tilburg University & Naturalis Biodiversity Center",
      year: "2023",
      url: "https://arxiv.org/abs/2311.04945",
      cta: "OPEN ON ARXIV",
      blurb:
        "AutoKeras-designed networks consistently beat MobileNet, ResNet50 and VGG16 at classifying " +
        "the calls of 20 wetland bird species, with no manual feature engineering or model design.",
      tag: "PREPRINT",
    },
  ],

  /* SOUNDTRACK — songs from the favourites playlist.
     yt = the YouTube video ID (the part after v= in the link). The player
     streams it through YouTube's embedded player, so the real song plays.
     If YouTube can't be reached or embedding is blocked for a video, that
     track falls back to a generated synthwave loop. You can also use a local
     file instead with  src: "music/filename.mp3". */
  tracks: [
    { title: "Half the World Away", artist: "Oasis", yt: "zMlMvrmWz84" },
    { title: "Favourite", artist: "Fontaines D.C.", yt: "0a_vpigwDb4" },
    { title: "My Own Worst Enemy", artist: "Lit", yt: "sc5iTNVEOAg" },
    { title: "What's Up?", artist: "Mom Jeans", yt: "6c5xITzAhjw" },
    { title: "Oddloop", artist: "frederic", yt: "PCp2iXA1uLE" },
    { title: "My Blood", artist: "DI-RECT", yt: "DfAPU8TN_Ms" },
    { title: "No Surprises", artist: "Radiohead", yt: "u5CVsCnxyXg" },
    { title: "Space Dementia", artist: "Muse", yt: "-bNnekk2_Yk" },
    { title: "Volevo Essere Un Duro", artist: "Lucio Corsi", yt: "Vlu5XXDwHos" },
  ],
};
