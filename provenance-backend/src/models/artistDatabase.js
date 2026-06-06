/**
 * Artist Reference Database
 *
 * This is Provenance's core reference dataset.
 * Each entry represents an artist whose influence can be detected
 * in AI-generated music.
 *
 * Fields:
 * - name: Artist name
 * - estate: Estate name (if applicable)
 * - hasEstate: Whether there's an active estate
 * - genreFamilies: Which genre families to check this artist against
 * - influenceType: What kind of influence (vocal, production, compositional, etc.)
 * - influenceDescription: Human-readable description of the influence
 * - audioProfile: Expected Spotify audio feature ranges
 * - activePeriod: Years active [start, end]
 * - baseInfluenceScore: Prior probability of this artist's influence (0-1)
 * - aiTrainingLikelihood: How likely this artist is in AI training data (0-1)
 */

module.exports = [
  {
    name: 'Michael Jackson',
    estate: 'Michael Jackson Estate',
    hasEstate: true,
    genreFamilies: ['rnb-soul', 'pop', 'funk'],
    influenceType: 'Vocal influence',
    influenceDescription: 'Phrasing, breath patterns, percussive interjections, and emotional delivery reflect Jackson\'s recordings.',
    audioProfile: {
      energyRange: [0.5, 0.9],
      tempoRange: [90, 130],
      danceabilityRange: [0.6, 0.9]
    },
    activePeriod: [1964, 2009],
    baseInfluenceScore: 0.70,
    aiTrainingLikelihood: 0.90
  },
  {
    name: 'Quincy Jones',
    estate: 'Quincy Jones Estate',
    hasEstate: true,
    genreFamilies: ['rnb-soul', 'pop', 'jazz'],
    influenceType: 'Production influence',
    influenceDescription: 'Orchestral arrangement, layered harmonics, and production signature reflect Jones\' approach.',
    audioProfile: {
      energyRange: [0.4, 0.8],
      tempoRange: [80, 120],
      danceabilityRange: [0.5, 0.8]
    },
    activePeriod: [1950, 2019],
    baseInfluenceScore: 0.55,
    aiTrainingLikelihood: 0.85
  },
  {
    name: 'Prince',
    estate: 'Prince Estate',
    hasEstate: true,
    genreFamilies: ['rnb-soul', 'funk', 'pop', 'rock'],
    influenceType: 'Vocal and production influence',
    influenceDescription: 'Falsetto range, Minneapolis Sound production, funk-influenced arrangements.',
    audioProfile: {
      energyRange: [0.6, 0.95],
      tempoRange: [95, 145],
      danceabilityRange: [0.65, 0.95]
    },
    activePeriod: [1975, 2016],
    baseInfluenceScore: 0.65,
    aiTrainingLikelihood: 0.88
  },
  {
    name: 'Aretha Franklin',
    estate: 'Aretha Franklin Estate',
    hasEstate: true,
    genreFamilies: ['gospel', 'rnb-soul', 'pop'],
    influenceType: 'Vocal influence',
    influenceDescription: 'Gospel-rooted melismatic delivery, raw emotional power, and commanding vocal presence.',
    audioProfile: {
      energyRange: [0.5, 0.9],
      tempoRange: [60, 130],
      danceabilityRange: [0.4, 0.8]
    },
    activePeriod: [1956, 2018],
    baseInfluenceScore: 0.70,
    aiTrainingLikelihood: 0.85
  },
  {
    name: 'Amy Winehouse',
    estate: 'Amy Winehouse Estate',
    hasEstate: true,
    genreFamilies: ['rnb-soul', 'jazz', 'pop'],
    influenceType: 'Vocal influence',
    influenceDescription: 'Jazz-inflected phrasing, raspy timbre, and intensely personal emotional delivery.',
    audioProfile: {
      energyRange: [0.3, 0.7],
      tempoRange: [70, 120],
      danceabilityRange: [0.4, 0.7]
    },
    activePeriod: [2003, 2011],
    baseInfluenceScore: 0.55,
    aiTrainingLikelihood: 0.80
  },
  {
    name: 'Jimi Hendrix',
    estate: 'Jimi Hendrix Estate',
    hasEstate: true,
    genreFamilies: ['blues', 'rock', 'psychedelic'],
    influenceType: 'Guitar influence',
    influenceDescription: 'Expressive bending, controlled feedback, and improvisational approach to electric guitar.',
    audioProfile: {
      energyRange: [0.6, 0.98],
      tempoRange: [80, 150],
      danceabilityRange: [0.4, 0.7]
    },
    activePeriod: [1963, 1970],
    baseInfluenceScore: 0.72,
    aiTrainingLikelihood: 0.85
  },
  {
    name: 'Nina Simone',
    estate: 'Nina Simone Estate',
    hasEstate: true,
    genreFamilies: ['jazz', 'rnb-soul', 'gospel', 'classical'],
    influenceType: 'Vocal and piano influence',
    influenceDescription: 'Classical piano training meeting jazz and soul vocal delivery with extraordinary emotional depth.',
    audioProfile: {
      energyRange: [0.2, 0.6],
      tempoRange: [50, 110],
      danceabilityRange: [0.2, 0.6]
    },
    activePeriod: [1954, 2003],
    baseInfluenceScore: 0.60,
    aiTrainingLikelihood: 0.82
  },
  {
    name: 'Miles Davis',
    estate: null,
    hasEstate: false,
    genreFamilies: ['jazz'],
    influenceType: 'Compositional and arrangement influence',
    influenceDescription: 'Modal jazz innovations, use of space and silence as compositional elements.',
    audioProfile: {
      energyRange: [0.15, 0.5],
      tempoRange: [50, 130],
      danceabilityRange: [0.2, 0.5]
    },
    activePeriod: [1944, 1991],
    baseInfluenceScore: 0.65,
    aiTrainingLikelihood: 0.80
  },
  {
    name: 'Timbaland',
    estate: null,
    hasEstate: false,
    genreFamilies: ['rnb-soul', 'hiphop', 'pop'],
    influenceType: 'Production influence',
    influenceDescription: 'Sparse, syncopated rhythmic structures and unconventional percussion placement.',
    audioProfile: {
      energyRange: [0.5, 0.85],
      tempoRange: [85, 125],
      danceabilityRange: [0.65, 0.90]
    },
    activePeriod: [1994, 2020],
    baseInfluenceScore: 0.52,
    aiTrainingLikelihood: 0.75
  },
  {
    name: 'Fela Kuti',
    estate: null,
    hasEstate: false,
    genreFamilies: ['afrobeats', 'funk'],
    influenceType: 'Rhythmic and cultural influence',
    influenceDescription: 'Afrobeat rhythmic patterns, polyrhythmic percussion, and extended musical forms.',
    audioProfile: {
      energyRange: [0.5, 0.85],
      tempoRange: [90, 135],
      danceabilityRange: [0.65, 0.92]
    },
    activePeriod: [1958, 1997],
    baseInfluenceScore: 0.60,
    aiTrainingLikelihood: 0.72
  },
  {
    name: 'Burna Boy',
    estate: null,
    hasEstate: false,
    genreFamilies: ['afrobeats', 'rnb-soul'],
    influenceType: 'Vocal and production influence',
    influenceDescription: 'Contemporary Afrofusion — blending Afrobeats, dancehall, and R&B production aesthetics.',
    audioProfile: {
      energyRange: [0.55, 0.85],
      tempoRange: [95, 130],
      danceabilityRange: [0.70, 0.92]
    },
    activePeriod: [2010, 2099],
    baseInfluenceScore: 0.58,
    aiTrainingLikelihood: 0.78
  },
  {
    name: 'Billie Holiday',
    estate: null,
    hasEstate: false,
    genreFamilies: ['jazz', 'blues'],
    influenceType: 'Vocal influence',
    influenceDescription: 'Intimate jazz phrasing, behind-the-beat timing, and deeply expressive tone.',
    audioProfile: {
      energyRange: [0.1, 0.45],
      tempoRange: [50, 100],
      danceabilityRange: [0.2, 0.5]
    },
    activePeriod: [1933, 1959],
    baseInfluenceScore: 0.55,
    aiTrainingLikelihood: 0.75
  },
  {
    name: 'James Brown',
    estate: null,
    hasEstate: false,
    genreFamilies: ['funk', 'rnb-soul', 'gospel'],
    influenceType: 'Rhythmic and vocal influence',
    influenceDescription: 'Foundational funk rhythms, percussive vocal style, and intensely physical performance energy.',
    audioProfile: {
      energyRange: [0.7, 0.98],
      tempoRange: [100, 145],
      danceabilityRange: [0.75, 0.98]
    },
    activePeriod: [1956, 2006],
    baseInfluenceScore: 0.62,
    aiTrainingLikelihood: 0.82
  },
  {
    name: 'Whitney Houston',
    estate: 'Whitney Houston Estate',
    hasEstate: true,
    genreFamilies: ['rnb-soul', 'gospel', 'pop'],
    influenceType: 'Vocal influence',
    influenceDescription: 'Powerful gospel-rooted technique, extraordinary range, and technically precise emotional delivery.',
    audioProfile: {
      energyRange: [0.45, 0.85],
      tempoRange: [65, 120],
      danceabilityRange: [0.4, 0.75]
    },
    activePeriod: [1983, 2012],
    baseInfluenceScore: 0.62,
    aiTrainingLikelihood: 0.85
  },
  {
    name: 'Bob Marley',
    estate: 'Bob Marley Foundation',
    hasEstate: true,
    genreFamilies: ['reggae'],
    influenceType: 'Vocal and rhythmic influence',
    influenceDescription: 'Reggae rhythmic foundation, relaxed vocal delivery, and spiritual lyrical sensibility.',
    audioProfile: {
      energyRange: [0.3, 0.65],
      tempoRange: [70, 100],
      danceabilityRange: [0.6, 0.85]
    },
    activePeriod: [1963, 1981],
    baseInfluenceScore: 0.65,
    aiTrainingLikelihood: 0.82
  },
  {
    name: 'Mahalia Jackson',
    estate: null,
    hasEstate: false,
    genreFamilies: ['gospel'],
    influenceType: 'Vocal and cultural influence',
    influenceDescription: 'The defining voice of American gospel — deep emotional conviction and powerful call-and-response tradition.',
    audioProfile: {
      energyRange: [0.4, 0.85],
      tempoRange: [55, 110],
      danceabilityRange: [0.3, 0.65]
    },
    activePeriod: [1929, 1972],
    baseInfluenceScore: 0.58,
    aiTrainingLikelihood: 0.72
  }
];
