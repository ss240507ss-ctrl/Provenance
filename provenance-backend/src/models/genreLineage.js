/**
 * Genre Lineage Model
 *
 * Maps genre families to their cultural lineage,
 * historical context, and key contributors.
 */

module.exports = {
  'rnb-soul': {
    lineage: [
      { name: 'Gospel traditions', description: 'The vocal and emotional foundation of R&B traces directly to Black American gospel music.' },
      { name: 'Blues', description: 'The 12-bar structure and emotional directness of blues runs through all R&B.' },
      { name: 'Motown sound', description: '1960s Detroit production — polished, melodic, crossover-focused — shaped modern R&B aesthetics.' },
      { name: '1980s–90s R&B', description: 'The production era from which most AI systems have absorbed their R&B vocabulary.' }
    ],
    culturalContext: 'R&B and Soul emerged from African American musical traditions, combining gospel emotional intensity with secular themes. The genre is rooted in communities whose creative labour shaped popular music globally — yet whose cultural contribution is frequently overlooked as the sounds migrate into mainstream commercial use.'
  },

  'gospel': {
    lineage: [
      { name: 'African American church tradition', description: 'Gospel is rooted in the spiritual music of enslaved African Americans, developing through the 19th and 20th centuries.' },
      { name: 'Spirituals', description: 'The precursor to gospel — songs of faith and survival from the era of slavery.' },
      { name: 'The Great Migration', description: 'As Black Americans moved north in the 20th century, gospel spread from Southern churches to Northern cities, developing new forms.' }
    ],
    culturalContext: 'Gospel music is among the most influential and least credited cultural exports in the history of popular music. Its vocal techniques — melismatic runs, call-and-response, emotional directness — form the foundation of R&B, soul, pop, and by extension, what AI systems learn as "expressive singing."'
  },

  'hiphop': {
    lineage: [
      { name: 'Funk and soul', description: 'Hip-hop sampling culture is built on funk and soul recordings — James Brown is the most sampled artist in history.' },
      { name: 'Blues tradition', description: 'The storytelling and emotional honesty of hip-hop traces to blues.' },
      { name: 'Jamaican sound system culture', description: 'DJ culture and MCing has roots in Jamaican sound systems that arrived in New York in the 1970s.' },
      { name: 'South Bronx, 1973', description: 'Hip-hop emerged from community block parties in the South Bronx — a specific cultural moment with specific people.' }
    ],
    culturalContext: 'Hip-hop emerged from Black and Latino communities in New York as a creative response to economic marginalisation. It has become the dominant global popular music form — yet its origins and the communities that created it are frequently erased as the culture goes mainstream and commercial.'
  },

  'jazz': {
    lineage: [
      { name: 'Blues', description: 'Jazz evolved directly from blues, inheriting its emotional language and improvisational spirit.' },
      { name: 'African musical traditions', description: 'Call-and-response patterns, polyrhythm, and improvisational approaches trace to West African musical culture.' },
      { name: 'New Orleans, early 20th century', description: 'Jazz was born in New Orleans — a specific place, a specific culture, specific communities.' }
    ],
    culturalContext: 'Jazz is one of the most significant American art forms, created by Black American musicians in the early 20th century. Its innovations — harmonic complexity, improvisational freedom, rhythmic sophistication — have influenced virtually every subsequent form of popular music.'
  },

  'blues': {
    lineage: [
      { name: 'African American work songs', description: 'Blues developed from work songs, field hollers, and spirituals in the post-Civil War American South.' },
      { name: 'Delta Blues', description: 'The original form — solo guitar and voice from the Mississippi Delta — is one of the foundational musical forms of the 20th century.' }
    ],
    culturalContext: 'Blues is the root of rock, soul, jazz, hip-hop, and by extension nearly all popular music. Created by African American musicians in the rural American South, its influence is pervasive and its cultural origins are among the most systematically overlooked in music history.'
  },

  'rock': {
    lineage: [
      { name: 'Blues', description: 'Rock and roll is directly descended from blues — a cultural transfer that has been extensively documented and debated.' },
      { name: 'Country and folk', description: 'Country and Appalachian folk traditions also fed into early rock and roll.' },
      { name: 'Rhythm and Blues', description: 'R&B — created by Black American musicians — was the immediate precursor to rock and roll.' }
    ],
    culturalContext: 'Rock and roll was created in the 1950s through the cultural interaction of Black R&B and country music — but Black musicians like Chuck Berry, Little Richard, and Fats Domino who defined the sound were frequently sidelined as white artists achieved greater commercial success performing similar material.'
  },

  'electronic': {
    lineage: [
      { name: 'Kraftwerk and European electronic music', description: 'The synthesiser-based sound palette of electronic music owes much to Kraftwerk\'s pioneering work in the 1970s.' },
      { name: 'Detroit Techno', description: 'Techno was created by Black Detroit musicians in the 1980s — a fact frequently overlooked in mainstream electronic music history.' },
      { name: 'Chicago House', description: 'House music emerged from Chicago\'s Black and LGBTQ+ communities — again, a cultural origin that tends to disappear in mainstream accounts.' }
    ],
    culturalContext: 'Electronic dance music has multiple and complex cultural origins — including significant roots in Black and LGBTQ+ communities in Chicago and Detroit that are frequently erased in popular histories of the genre.'
  },

  'pop': {
    lineage: [
      { name: 'R&B and soul', description: 'Contemporary pop is overwhelmingly shaped by R&B production techniques and vocal styles.' },
      { name: 'Rock', description: 'Rock\'s melodic directness and song structures feed into pop.' },
      { name: 'Electronic production', description: 'Modern pop production is heavily electronic, drawing on dance music traditions.' }
    ],
    culturalContext: 'Pop music is a synthesis — it draws from virtually every other musical tradition while often obscuring those origins. R&B and Black musical traditions in particular have been foundational to mainstream pop throughout its history.'
  },

  'afrobeats': {
    lineage: [
      { name: 'West African musical traditions', description: 'Afrobeats is rooted in West African rhythmic and melodic traditions going back centuries.' },
      { name: 'Highlife', description: 'Highlife — a Ghanaian genre blending African and Western elements — is a direct ancestor of contemporary Afrobeats.' },
      { name: 'Fela Kuti\'s Afrobeat', description: 'Fela Kuti\'s original Afrobeat (distinct from contemporary Afrobeats) was a foundational political and musical force.' },
      { name: 'Jùjú music', description: 'The Nigerian jùjú tradition, particularly King Sunny Ade, contributed essential rhythmic vocabulary.' }
    ],
    culturalContext: 'Afrobeats is one of the most significant global music movements of the 21st century. It has become enormously commercially successful internationally — raising complex questions about cultural appropriation, credit, and the economic benefits flowing back to the communities and countries that created the sound.'
  },

  'reggae': {
    lineage: [
      { name: 'Jamaican mento and ska', description: 'Reggae evolved from mento (Jamaican folk music) through ska and rocksteady in the 1960s.' },
      { name: 'R&B and soul influences', description: 'American R&B broadcast on radio from Miami was a significant influence on early Jamaican popular music.' }
    ],
    culturalContext: 'Reggae emerged from Jamaica in the late 1960s — initially ignored by mainstream markets and later embraced globally, largely through Bob Marley. The tension between global commercial success and the communities of origin is a recurring theme in reggae\'s history.'
  },

  'folk-country': {
    lineage: [
      { name: 'Appalachian folk traditions', description: 'Rooted in the folk music brought by European (particularly British and Irish) immigrants to the Appalachian Mountains.' },
      { name: 'Blues influence', description: 'The influence of blues on country music is significant and complex — the two traditions developed in close proximity in the American South.' }
    ],
    culturalContext: 'Folk and country music traditions document rural American life and reflect both European immigrant culture and the unavoidable influence of African American musical traditions in the American South.'
  },

  'latin': {
    lineage: [
      { name: 'African rhythmic traditions', description: 'The rhythmic complexity of Latin music — salsa, cumbia, bossa nova — traces to African musical traditions brought to Latin America through the slave trade.' },
      { name: 'Indigenous American music', description: 'Indigenous musical traditions of the Americas contribute to Latin music\'s diverse sonic palette.' },
      { name: 'European harmony and melody', description: 'European harmonic and melodic traditions, brought through colonisation, blend with African rhythms to create Latin music\'s characteristic sound.' }
    ],
    culturalContext: 'Latin music encompasses enormous diversity — from bossa nova to reggaeton — unified by a shared history of cultural mixing, African rhythmic foundations, and complex relationships with colonial history and cultural identity.'
  },

  'classical': {
    lineage: [
      { name: 'European classical tradition', description: 'A 500-year Western tradition of formal composition, from Renaissance polyphony through baroque, classical, romantic, and modernist periods.' }
    ],
    culturalContext: 'Classical music\'s influence on AI is significant — much AI music training data includes classical recordings, and orchestral production techniques have diffused throughout popular music production, particularly through producers like Quincy Jones who bridged classical and pop.'
  }
};
