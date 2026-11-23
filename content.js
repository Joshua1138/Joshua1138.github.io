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
  papers: [
    {
      title: "Auto deep learning for bioacoustic signals",
      authors: "G. Tosato, A. Shehata, J. Janssen, K. Kamp, P. Jati, D. Stowell",
      venue: "arXiv preprint",
      year: "2023",
      url: "https://arxiv.org/abs/2311.04945",
      blurb:
        "Can automated deep learning beat hand-built models at classifying bird calls? Using " +
        "AutoKeras for architecture search and tuning on the Western Mediterranean Wetland Birds " +
        "dataset, the resulting model consistently outperformed MobileNet, ResNet50 and VGG16, " +
        "with reproducibility guidelines for bioacoustics on top.",
      tag: "PREPRINT",
    },
    {
      title: "Watching Without Waiting: Real-Time Work-State Recognition for Collaborative Robots",
      authors: "Joshua Janssen",
      venue: "Master's thesis, Tilburg University",
      year: "2026",
      url: "https://arno.uvt.nl/show.cgi?fid=179634",
      blurb:
        "How well can a robot read what a person is doing in real time, from one overhead camera " +
        "and 2D skeleton pose alone? I made a causal (past-only) MS-TCN that reaches 74.9% frame " +
        "accuracy on IKEA furniture assembly, within a point of the model that sees the future, " +
        "and built a dependency graph showing which assembly steps a cobot could take over.",
      tag: "THESIS",
    },
  ],

  /* SOUNDTRACK — songs from the favourites playlist.
     The player never links to Spotify. Each song gets its own generated
     synthwave loop so the player always makes sound. If you want the real
     song to play instead, drop an mp3 you're allowed to use into /music and
     set  src: "music/filename.mp3". */
  tracks: [
    { title: "Half the World Away", artist: "Oasis" },
    { title: "Favourite", artist: "Fontaines D.C." },
    { title: "My Own Worst Enemy", artist: "Lit" },
    { title: "What's Up?", artist: "Mom Jeans" },
    { title: "Oddloop", artist: "frederic" },
    { title: "My Blood", artist: "DI-RECT" },
    { title: "No Surprises", artist: "Radiohead" },
    { title: "Space Dementia", artist: "Muse" },
    { title: "Volevo essere un duro (Dal vivo all'Abbazia di San Galgano)", artist: "Lucio Corsi" },
  ],
};
