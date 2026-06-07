/**
 * Genre Lineage Model — Comprehensive Edition
 * Maps genre families to cultural lineage, historical context, and key contributors.
 */

module.exports = {

  // ── AFRICAN GENRES ────────────────────────────────────────────────────────

  'amapiano': {
    lineage: [
      { name: 'South African Deep House', description: 'Amapiano evolved directly from deep house music circulating in South African townships in the 2010s.' },
      { name: 'Kwaito', description: 'Kwaito — the defining sound of post-apartheid South African youth — contributed its slow tempo and township energy.' },
      { name: 'South African Jazz', description: 'The distinctive log drum bassline and jazz piano improvisations reflect a deep South African jazz tradition.' },
      { name: 'Gospel influences', description: 'The call-and-response vocal style and communal energy in Amapiano draw from South African gospel.' }
    ],
    culturalContext: 'Amapiano was born in the townships of Pretoria and Johannesburg around 2012–2016, created by producers including DJ Maphorisa, Kabza De Small, MFR Souls, and Focalistic. Its name means "the pianos" in Zulu. The genre is defined by its log drum bass, jazz piano loops, and a distinctively South African groove. It has become one of the most globally significant African music exports of the 21st century — raising important questions about cultural credit as international artists adopt its sound without always acknowledging its origins.'
  },

  'afrobeats': {
    lineage: [
      { name: 'West African musical traditions', description: 'Afrobeats is rooted in West African rhythmic and melodic traditions going back centuries.' },
      { name: 'Highlife', description: 'Highlife — blending African and Western elements in Ghana and Nigeria — is a direct ancestor of contemporary Afrobeats.' },
      { name: "Fela Kuti's Afrobeat", description: "Fela Kuti's original Afrobeat (distinct from contemporary Afrobeats) provided political consciousness and rhythmic foundations." },
      { name: 'Jùjú music', description: "The Nigerian jùjú tradition, particularly King Sunny Ade, contributed essential rhythmic vocabulary." },
      { name: 'American R&B and hip-hop', description: 'Contemporary Afrobeats absorbed production aesthetics from American R&B and hip-hop, creating a global fusion.' }
    ],
    culturalContext: 'Contemporary Afrobeats emerged from Nigeria and Ghana in the 2000s, driven by artists like Wizkid, Davido, Burna Boy, and producers like Don Jazzy. It is now a global phenomenon, with its rhythms and production aesthetics appearing in mainstream pop worldwide. The tension between global commercial success and proper attribution to the communities and countries that created the sound is central to Afrobeats\' story.'
  },

  'afropop': {
    lineage: [
      { name: 'Afrobeats', description: 'Afropop shares its roots with Afrobeats, drawing on West African rhythmic traditions.' },
      { name: 'Western pop', description: 'Afropop blends African musical traditions with Western pop song structures and production.' },
      { name: 'Highlife', description: 'The melodic sweetness of Highlife runs through Afropop\'s DNA.' }
    ],
    culturalContext: 'Afropop is a broad term covering African popular music that blends traditional African elements with global pop aesthetics. It encompasses artists across the continent and diaspora who are bringing African sounds to global audiences while navigating questions of authenticity and cultural identity.'
  },

  'afrosoul': {
    lineage: [
      { name: 'African musical traditions', description: 'Deep roots in the musical traditions of Sub-Saharan Africa.' },
      { name: 'American Soul and R&B', description: 'African Soul absorbed the emotional directness and vocal techniques of American soul music.' },
      { name: 'Gospel', description: 'African gospel traditions — both American-influenced and indigenous — feed into Afrosoul.' }
    ],
    culturalContext: 'Afrosoul blends the emotional intensity of American soul with African musical traditions and sensibilities. South African artists like Lira, Simphiwe Dana, and Yvonne Chaka Chaka have been central to defining this sound.'
  },

  'kwaito': {
    lineage: [
      { name: 'House music', description: 'Kwaito slowed down house music tempos and added South African township culture.' },
      { name: 'Mbaqanga', description: 'The infectious township pop of Mbaqanga contributed energy and local character.' },
      { name: 'American hip-hop', description: 'The spoken word and street narrative elements were influenced by American hip-hop.' }
    ],
    culturalContext: 'Kwaito emerged in Johannesburg\'s townships in the early 1990s as the sound of post-apartheid freedom. Artists like Arthur Mafokate, TKZee, and Mandoza defined a generation. Kwaito is directly in the lineage of Amapiano — the sound South African youth made when they took house music and made it entirely their own.'
  },

  'afrohouse': {
    lineage: [
      { name: 'House music', description: 'Afro House takes the structure and energy of house music as its foundation.' },
      { name: 'African percussion traditions', description: 'African drum patterns and percussive sensibilities are central to Afro House.' },
      { name: 'Deep House', description: 'The soulful depth of Chicago and South African deep house feeds into Afro House.' }
    ],
    culturalContext: 'Afro House emerged as African producers and DJs — particularly from South Africa — brought African rhythmic sensibilities to house music. Producers like Black Coffee have been central to bringing Afro House to global audiences while keeping its African roots visible.'
  },

  'highlife': {
    lineage: [
      { name: 'West African folk music', description: 'Highlife grew from West African traditional music, particularly from Ghana and Nigeria.' },
      { name: 'Western brass band music', description: 'Colonial-era brass band music merged with local rhythms to create early Highlife.' },
      { name: 'Palm wine music', description: 'The acoustic Palm Wine guitar tradition of Sierra Leone and Ghana fed directly into Highlife.' }
    ],
    culturalContext: 'Highlife is one of the oldest African popular music genres, originating in Ghana in the early 20th century. It has been foundational to virtually all subsequent West African popular music. Artists like ET Mensah, Osibisa, and King Sunny Ade helped define the genre that would eventually influence Afrobeats, Afropop, and global pop.'
  },

  'afrobeats-uk': {
    lineage: [
      { name: 'Nigerian Afrobeats', description: 'UK Afrobeats draws directly from Nigerian Afrobeats as brought by the diaspora.' },
      { name: 'UK Grime and Garage', description: 'British urban music traditions shaped how the diaspora adapted African sounds.' },
      { name: 'R&B', description: 'R&B production aesthetics blend with African rhythms in UK Afrobeats.' }
    ],
    culturalContext: 'The Nigerian and broader African diaspora in the UK created a distinctive Afrobeats scene that blends African roots with British urban culture. Artists like Skepta collaborating with African artists, and figures like Afrobeats pioneer Fuse ODG, have built bridges between African and British music scenes.'
  },

  'bongo-flava': {
    lineage: [
      { name: 'Taarab', description: 'Taarab — the Swahili coastal music blending Arab, Indian, and African elements — is foundational.' },
      { name: 'American R&B and hip-hop', description: 'Bongo Flava absorbed American hip-hop aesthetics and adapted them to Tanzanian culture.' },
      { name: 'Dansi', description: 'Tanzanian Dansi band music contributed its grooves to Bongo Flava.' }
    ],
    culturalContext: 'Bongo Flava is the dominant popular music of Tanzania, emerging in Dar es Salaam in the 1990s. Artists like Diamond Platnumz have taken Bongo Flava to international audiences. The genre blends Swahili language and East African culture with global hip-hop and R&B aesthetics.'
  },

  'gengetone': {
    lineage: [
      { name: 'Genge music', description: 'Gengetone evolved from Genge — Kenyan hip-hop rooted in Nairobi street culture.' },
      { name: 'Afrobeats', description: 'Contemporary Afrobeats production aesthetics influence Gengetone.' },
      { name: 'Kapuka', description: 'Kapuka — upbeat Kenyan pop — contributed melodic and rhythmic elements.' }
    ],
    culturalContext: 'Gengetone emerged in Nairobi around 2019, created by groups like Ethic Entertainment, Sailors Guild, and Mbogi Genje. It is raw, street-level Kenyan music rooted in the experiences of young people in Nairobi\'s estates. The genre sparked significant controversy in Kenya around its explicit content while becoming a cultural force.'
  },

  'zimbabwe-sungura': {
    lineage: [
      { name: 'Congolese Rumba', description: 'Sungura absorbed the guitar style and rhythms of Congolese Rumba.' },
      { name: 'Zimbabwean folk music', description: 'Local Zimbabwean traditions and the mbira (thumb piano) influence Sungura.' }
    ],
    culturalContext: 'Sungura is Zimbabwe\'s most popular indigenous music genre, characterised by fast-paced guitar rhythms and Shona lyrics. Artists like Alick Macheso and Leonard Zhakata have kept this distinctly Zimbabwean sound alive across generations.'
  },

  'congolese-rumba': {
    lineage: [
      { name: 'Cuban Son and Rumba', description: 'Congolese musicians absorbed Cuban music heard on Radio Congo in the 1940s and transformed it.' },
      { name: 'Central African rhythms', description: 'Indigenous Central African percussion and rhythm traditions fused with Cuban influences.' }
    ],
    culturalContext: 'Congolese Rumba — also known as Soukous — emerged from Kinshasa and Brazzaville in the 1940s and became one of the most influential music genres across Africa. Artists like Franco Luambo and Tabu Ley Rochereau defined a sound that spread across the continent. It is the ancestor of much of Central and East African popular music.'
  },

  // ── BLACK AMERICAN GENRES ─────────────────────────────────────────────────

  'rnb-soul': {
    lineage: [
      { name: 'Gospel traditions', description: 'The vocal and emotional foundation of R&B traces directly to Black American gospel music.' },
      { name: 'Blues', description: 'The 12-bar structure and emotional directness of blues runs through all R&B.' },
      { name: 'Motown sound', description: '1960s Detroit production — polished, melodic, crossover-focused — shaped modern R&B.' },
      { name: '1980s–90s R&B', description: 'The production era from which most AI systems have absorbed their R&B vocabulary.' }
    ],
    culturalContext: 'R&B and Soul emerged from African American musical traditions, combining gospel emotional intensity with secular themes. The genre is rooted in communities whose creative labour shaped popular music globally — yet whose cultural contribution is frequently overlooked as the sounds migrate into mainstream commercial use.'
  },

  'neo-soul': {
    lineage: [
      { name: 'Classic Soul and R&B', description: 'Neo Soul emerged as a reaction to overproduced 90s R&B, returning to the organic feel of 60s and 70s soul.' },
      { name: 'Jazz', description: 'Neo Soul incorporates jazz harmony, improvisation, and live instrumentation.' },
      { name: 'Hip-hop', description: 'The rhythmic sensibility and production aesthetics of hip-hop run through Neo Soul.' },
      { name: 'Funk', description: "James Brown and George Clinton's funk traditions feed directly into Neo Soul groove." }
    ],
    culturalContext: "Neo Soul emerged in the mid-1990s through artists like D'Angelo, Erykah Badu, Lauryn Hill, and Maxwell. It was a conscious return to the emotional honesty and organic production of classic soul, pushing back against the commercial gloss of mainstream R&B. The genre has been hugely influential on Frank Ocean, SZA, H.E.R., and a generation of contemporary artists."
  },

  'trap-soul': {
    lineage: [
      { name: 'Trap music', description: 'Trap Soul takes the 808 bass and hi-hat patterns of trap and fuses them with R&B melody.' },
      { name: 'R&B and Soul', description: 'The emotional directness and vocal intimacy come from classic R&B traditions.' },
      { name: 'Neo Soul', description: "The introspective lyrical approach owes much to Neo Soul artists like D'Angelo and Erykah Badu." }
    ],
    culturalContext: "Trap Soul was largely defined by Bryson Tiller's 2015 album TRAPSOUL, fusing Atlanta trap production with R&B vulnerability. Drake, PartyNextDoor, and Tory Lanez helped define the sound — a generation processing emotional complexity over dark, minimal trap beats."
  },

  'gospel': {
    lineage: [
      { name: 'African American church tradition', description: 'Gospel developed from spiritual music of enslaved African Americans through the 19th and 20th centuries.' },
      { name: 'Spirituals', description: 'Songs of faith and survival from the era of slavery are gospel\'s direct ancestors.' },
      { name: 'The Great Migration', description: 'As Black Americans moved north, gospel spread from Southern churches to Northern cities, developing new forms.' }
    ],
    culturalContext: 'Gospel music is among the most influential and least credited cultural exports in music history. Its vocal techniques — melismatic runs, call-and-response, emotional directness — form the foundation of R&B, soul, pop, and by extension what AI systems learn as expressive singing.'
  },

  'hiphop': {
    lineage: [
      { name: 'Funk and soul', description: "Hip-hop sampling culture is built on funk and soul recordings — James Brown is the most sampled artist in history." },
      { name: 'Blues tradition', description: 'The storytelling and emotional honesty of hip-hop traces to blues.' },
      { name: 'Jamaican sound system culture', description: 'DJ culture and MCing has roots in Jamaican sound systems that arrived in New York in the 1970s.' },
      { name: 'South Bronx, 1973', description: "Hip-hop emerged from community block parties in the South Bronx — a specific cultural moment with specific people." }
    ],
    culturalContext: 'Hip-hop emerged from Black and Latino communities in New York as a creative response to economic marginalisation. It has become the dominant global popular music form — yet its origins and the communities that created it are frequently erased as the culture goes mainstream and commercial.'
  },

  'trap': {
    lineage: [
      { name: 'Southern hip-hop', description: 'Trap emerged from Atlanta\'s hip-hop scene in the late 1990s and early 2000s.' },
      { name: 'Crunk', description: 'Crunk\'s aggressive energy and Southern identity fed into early trap music.' },
      { name: 'Blues and soul', description: 'The melancholic undertones of trap connect to the blues tradition of the American South.' }
    ],
    culturalContext: 'Trap music was born in Atlanta, Georgia, named after the "trap house" — a place where drugs are sold. Artists like T.I., Gucci Mane, and Young Jeezy defined the original sound before producers like Metro Boomin and Southside developed the cinematic 808-driven production that became globally dominant.'
  },

  'drill': {
    lineage: [
      { name: 'Chicago trap', description: 'Drill emerged from Chicago\'s South Side as a darker, more aggressive take on trap music.' },
      { name: 'UK Grime', description: 'UK Drill fused Chicago Drill with British grime sensibilities to create a distinct sound.' },
      { name: 'Brooklyn Drill', description: 'New York producers added melodic elements to create a third major Drill variant.' }
    ],
    culturalContext: 'Drill originated in Chicago\'s Chiraq around 2010-2012, with Chief Keef as its defining voice. It spread to the UK where it fused with grime, and then back to New York where it evolved again. Each iteration reflects the specific circumstances of young Black men in different urban contexts — music made as a direct response to systemic violence and poverty.'
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

  'funk': {
    lineage: [
      { name: 'R&B and Soul', description: 'Funk intensified the rhythmic elements of R&B and Soul to create something new.' },
      { name: 'Gospel', description: "James Brown's gospel-trained energy and call-and-response style are central to funk." },
      { name: 'Jazz', description: 'Jazz improvisation and harmonic complexity feed into funk.' }
    ],
    culturalContext: "Funk was created by James Brown, Sly Stone, and George Clinton in the late 1960s. Its emphasis on rhythm over melody, the ONE beat, and collective groove became foundational to hip-hop, electronic dance music, and virtually all contemporary Black music production."
  },

  'motown': {
    lineage: [
      { name: 'Gospel', description: 'The vocal techniques and emotional power of gospel are at the heart of the Motown sound.' },
      { name: 'Blues and R&B', description: 'The emotional directness of blues and early R&B grounds the Motown style.' },
      { name: 'Pop craftsmanship', description: "Berry Gordy's vision of accessible, radio-friendly pop shaped Motown's song structures." }
    ],
    culturalContext: "Motown Records, founded by Berry Gordy in Detroit in 1959, became one of the most successful and culturally significant record labels in history. The 'Sound of Young America' — created by Black artists for a racially integrated audience — changed American popular music and culture. Artists like Marvin Gaye, Stevie Wonder, Diana Ross, and The Temptations defined an era."
  },

  // ── ELECTRONIC GENRES ─────────────────────────────────────────────────────

  'electronic': {
    lineage: [
      { name: 'Kraftwerk and European electronic music', description: "Kraftwerk's synthesiser-based sound palette was foundational to electronic music." },
      { name: 'Detroit Techno', description: "Techno was created by Black Detroit musicians in the 1980s — a fact frequently overlooked." },
      { name: 'Chicago House', description: "House music emerged from Chicago's Black and LGBTQ+ communities." }
    ],
    culturalContext: "Electronic dance music has multiple and complex cultural origins — including significant roots in Black and LGBTQ+ communities in Chicago and Detroit that are frequently erased in popular histories of the genre."
  },

  'house': {
    lineage: [
      { name: 'Disco', description: 'House music emerged directly from the ashes of disco in Chicago in the early 1980s.' },
      { name: 'Soul and Gospel', description: "The soulful vocal element of house music — especially gospel house — comes directly from Black church music." },
      { name: 'Electronic experimentation', description: 'Synthesisers, drum machines (especially the Roland TR-808 and TR-909), and tape manipulation.' }
    ],
    culturalContext: "House music was created by Black and Latino DJs and producers in Chicago's underground clubs, particularly The Warehouse where DJ Frankie Knuckles played. It was a music of liberation for Black and LGBTQ+ communities. Its influence on global dance music is immeasurable."
  },

  'techno': {
    lineage: [
      { name: "Detroit's industrial decline", description: "Techno was a direct response to Detroit's post-industrial landscape — music made in the ruins of the auto industry." },
      { name: 'Kraftwerk', description: "German electronic music, particularly Kraftwerk, was a key influence on Detroit techno producers." },
      { name: 'Funk and soul', description: "The Belleville Three — Juan Atkins, Kevin Saunderson, Derrick May — grew up on funk and soul." }
    ],
    culturalContext: "Techno was invented by three young Black men from Belleville, Michigan — Juan Atkins, Kevin Saunderson, and Derrick May — in the early 1980s. This fact is often erased as techno became associated with white European rave culture. Detroit techno is one of the most important and least credited cultural contributions in electronic music history."
  },

  'drum-and-bass': {
    lineage: [
      { name: 'Jungle music', description: 'Drum and Bass evolved directly from Jungle, which itself emerged from UK rave culture and Jamaican sound system culture.' },
      { name: 'Reggae and Dancehall', description: "The bass weight and sound system culture of Jamaican music is foundational to D&B." },
      { name: 'Rave and Hardcore', description: "Early 90s UK rave and hardcore techno sped up into the breakbeat-driven sound of D&B." }
    ],
    culturalContext: "Drum and Bass emerged from the multicultural underground club scene of early 1990s London, where Black British, Caribbean, and white working-class youth created something entirely new. Artists like Goldie, LTJ Bukem, and Roni Size defined a genre that continues to evolve."
  },

  'dubstep': {
    lineage: [
      { name: 'UK Garage', description: "Dubstep evolved from the half-time rhythms of UK Garage." },
      { name: 'Dub reggae', description: "The spacious, bass-heavy production of Jamaican dub reggae gave dubstep its sonic DNA." },
      { name: 'Drum and Bass', description: "D&B's bass culture and club context fed into the development of dubstep." }
    ],
    culturalContext: "Dubstep emerged from South London's underground club scene in the early 2000s, centred around nights like Forward>> at Plastic People. Producers like Skream, Benga, and Digital Mystikz created a music of extraordinary bass weight and space. Its subsequent commercialisation by American producers like Skrillex created a entirely different sound often called 'brostep'."
  },

  'edm': {
    lineage: [
      { name: 'House and Techno', description: "EDM draws from the foundations of house and techno but optimised for stadium festival audiences." },
      { name: 'Trance', description: 'European trance music contributed melodic and euphoric elements to EDM.' },
      { name: 'Electro house', description: "French house and electro house were direct precursors to the EDM boom." }
    ],
    culturalContext: "EDM as a category became commercially dominant in the 2010s, transforming what had been underground dance music into a mainstream stadium spectacle. While commercially successful, its relationship to the Black and LGBTQ+ origins of dance music culture is complicated and often unacknowledged."
  },

  'ambient': {
    lineage: [
      { name: 'Brian Eno', description: "Brian Eno essentially invented ambient music as a genre with 'Ambient 1: Music for Airports' in 1978." },
      { name: 'Minimalist classical music', description: 'The slow, static quality of ambient music draws from minimalist composers like Terry Riley and Steve Reich.' },
      { name: 'Electronic experimentation', description: 'Synthesiser and tape manipulation techniques from the 1960s and 70s feed into ambient.' }
    ],
    culturalContext: "Ambient music created a new relationship between listener and sound — music designed to be heard without active listening, to blend with environment. Its influence runs from new age music to lo-fi hip hop study beats to the background music of contemporary apps and games."
  },

  // ── ROCK AND GUITAR-BASED GENRES ──────────────────────────────────────────

  'rock': {
    lineage: [
      { name: 'Blues', description: 'Rock and roll is directly descended from blues — a cultural transfer that has been extensively documented and debated.' },
      { name: 'Country and folk', description: 'Country and Appalachian folk traditions also fed into early rock and roll.' },
      { name: 'Rhythm and Blues', description: 'R&B — created by Black American musicians — was the immediate precursor to rock and roll.' }
    ],
    culturalContext: "Rock and roll was created in the 1950s through the cultural interaction of Black R&B and country music — but Black musicians like Chuck Berry, Little Richard, and Fats Domino who defined the sound were frequently sidelined as white artists achieved greater commercial success performing similar material."
  },

  'indie-rock': {
    lineage: [
      { name: 'Post-punk', description: 'Indie rock emerged from the post-punk scene of the late 1970s and early 1980s.' },
      { name: 'Classic rock', description: "The guitar-driven song structures of classic rock inform indie rock's sound." },
      { name: 'DIY culture', description: "Indie rock's ethos of independent production and distribution is as much a cultural position as a sonic one." }
    ],
    culturalContext: "Indie rock developed as an alternative to major label commercial rock, centred around independent labels like SST, Matador, and Sub Pop. It became a cultural identity as much as a genre, associated with a particular white alternative youth culture that dominated the 1990s and 2000s."
  },

  'metal': {
    lineage: [
      { name: 'Blues', description: 'Heavy metal\'s distorted guitar sound is an amplification of blues guitar technique.' },
      { name: 'Classical music', description: 'Metal\'s dramatic structures, technical virtuosity, and grandeur draw from classical composition.' },
      { name: 'Hard rock', description: "Metal emerged from the amplified, distorted end of rock — artists like Black Sabbath and Led Zeppelin." }
    ],
    culturalContext: "Metal was created in Birmingham, England by working-class musicians — Black Sabbath, Judas Priest — whose industrial city backdrop shaped their dark, heavy sound. It has since fragmented into dozens of subgenres across the globe, from Norwegian black metal to Brazilian death metal to Japanese visual kei."
  },

  'punk': {
    lineage: [
      { name: 'Garage rock', description: "Punk's raw, stripped-back sound is a return to early rock and roll garage simplicity." },
      { name: 'Proto-punk', description: 'Velvet Underground, The Stooges, and MC5 prefigured punk\'s attitude and sound.' },
      { name: 'Working-class anger', description: "Punk was a direct expression of working-class British youth frustration in the mid-1970s." }
    ],
    culturalContext: "Punk emerged simultaneously in New York (Ramones, Patti Smith, Television) and London (Sex Pistols, The Clash, Buzzcocks) in the mid-1970s. As a cultural movement it rejected the bloated excess of stadium rock and challenged class, race, and gender norms. Its DIY ethos continues to influence music culture."
  },

  'grunge': {
    lineage: [
      { name: 'Punk and hardcore', description: "Grunge channelled punk's aggression and DIY ethic through heavier guitar tones." },
      { name: 'Heavy metal', description: "Metal's guitar distortion and heaviness fed into grunge." },
      { name: 'Neil Young', description: "Neil Young's distorted guitar and emotional directness earned him the title 'godfather of grunge'." }
    ],
    culturalContext: "Grunge emerged from Seattle in the late 1980s and early 1990s, with Nirvana, Pearl Jam, Soundgarden, and Alice in Chains as its defining acts. It was a working-class, Pacific Northwest sound that broke into mainstream consciousness in 1991 and briefly redefined American rock music."
  },

  // ── CARIBBEAN AND LATIN GENRES ────────────────────────────────────────────

  'reggae': {
    lineage: [
      { name: 'Jamaican mento and ska', description: 'Reggae evolved from mento through ska and rocksteady in the 1960s.' },
      { name: 'R&B and soul influences', description: 'American R&B broadcast on radio from Miami was a significant influence on early Jamaican popular music.' }
    ],
    culturalContext: "Reggae emerged from Jamaica in the late 1960s. Through Bob Marley it reached a global audience while carrying messages of Rastafari and resistance to oppression. The tension between global commercial success and the communities of origin is a recurring theme in reggae's history."
  },

  'dancehall': {
    lineage: [
      { name: 'Reggae', description: 'Dancehall emerged from reggae in Jamaica in the late 1970s, shifting from live bands to digital riddims.' },
      { name: 'Sound system culture', description: "Jamaica's sound system culture — mobile DJs playing for communities — is central to dancehall." },
      { name: 'Deejaying (toasting)', description: "The Jamaican tradition of DJs chatting over riddims is the direct ancestor of both dancehall and hip-hop." }
    ],
    culturalContext: "Dancehall is the sound of contemporary Jamaica, evolving through artists from Yellowman to Shabba Ranks to Vybz Kartel and Popcaan. Its digital production, sexual and violent themes, and distinctive patois have spread globally through the diaspora. Dancehall's influence on Afrobeats, UK Grime, and global pop is immense and often unacknowledged."
  },

  'latin': {
    lineage: [
      { name: 'African rhythmic traditions', description: 'The rhythmic complexity of Latin music traces to African musical traditions brought through the slave trade.' },
      { name: 'Indigenous American music', description: 'Indigenous traditions of the Americas contribute to Latin music\'s diverse sonic palette.' },
      { name: 'European harmony and melody', description: 'European harmonic and melodic traditions brought through colonisation blend with African rhythms.' }
    ],
    culturalContext: "Latin music encompasses enormous diversity — unified by a shared history of cultural mixing, African rhythmic foundations, and complex relationships with colonial history and cultural identity."
  },

  'reggaeton': {
    lineage: [
      { name: 'Dancehall', description: "Reggaeton grew from the Jamaican dancehall music brought to Panama and Puerto Rico." },
      { name: 'Hip-hop', description: "American hip-hop's production aesthetics and rap style merged with Caribbean rhythms." },
      { name: 'Bomba and Plena', description: "Puerto Rican traditional music contributed cultural identity to reggaeton." }
    ],
    culturalContext: "Reggaeton emerged from Puerto Rico and Panama in the 1990s, originally an underground music associated with working-class youth before becoming a global commercial phenomenon through artists like Daddy Yankee, Don Omar, J Balvin, and Bad Bunny. Its Dembow rhythm has become one of the most recognisable beats in global pop."
  },

  'salsa': {
    lineage: [
      { name: 'Cuban Son', description: 'Salsa evolved from Cuban Son and other Afro-Cuban musical forms.' },
      { name: 'Puerto Rican and New York Latin communities', description: "Salsa was developed by Puerto Rican and Cuban musicians in New York City in the 1960s and 70s." },
      { name: 'Jazz', description: 'Latin jazz and big band elements feed into salsa\'s arrangements.' }
    ],
    culturalContext: "Salsa was created by Latin communities in New York City, particularly in the Bronx and Spanish Harlem, as an expression of Latinx identity in America. It blended Cuban, Puerto Rican, and other Caribbean musical traditions into something new — music of displacement, identity, and joy."
  },

  'bossa-nova': {
    lineage: [
      { name: 'Brazilian Samba', description: "Bossa Nova emerged from Samba, softening its rhythm and adding jazz harmonic sophistication." },
      { name: 'American Cool Jazz', description: "West Coast cool jazz, particularly Miles Davis, influenced Bossa Nova's restrained aesthetic." },
      { name: 'Brazilian classical music', description: "Classical training and composition techniques shaped Bossa Nova's harmonic language." }
    ],
    culturalContext: "Bossa Nova was created in Rio de Janeiro in the late 1950s by João Gilberto, Antônio Carlos Jobim, and Vinícius de Moraes. 'The Girl from Ipanema' became one of the most recorded songs in history. Bossa Nova represented a middle-class Brazilian urban sensibility and became a globally influential genre."
  },

  // ── SOUTH ASIAN GENRES ────────────────────────────────────────────────────

  'bollywood': {
    lineage: [
      { name: 'Hindustani classical music', description: 'Bollywood film music draws from North Indian classical traditions.' },
      { name: 'Qawwali', description: 'The devotional Sufi music tradition of Qawwali influences Bollywood\'s more spiritual moments.' },
      { name: 'Western pop and jazz', description: 'Bollywood absorbed Western pop, jazz, and later hip-hop and electronic influences.' }
    ],
    culturalContext: "Bollywood music is the soundtrack of Indian popular culture, shaped by composers like R.D. Burman and A.R. Rahman. Its influence stretches across the South Asian diaspora globally. As the world's largest film industry, Bollywood's music has a reach that is often underestimated by Western music industries."
  },

  'bhangra': {
    lineage: [
      { name: 'Punjabi folk music', description: "Bhangra originated as Punjabi harvest festival music in the Punjab region." },
      { name: 'UK Asian underground', description: "British Bhangra in the 1980s fused traditional sounds with contemporary production." },
      { name: 'Hip-hop and R&B', description: "Contemporary Bhangra has absorbed hip-hop and R&B aesthetics." }
    ],
    culturalContext: "Bhangra transformed from a Punjabi harvest dance into a globally recognised genre through the South Asian diaspora in the UK. Artists like Apache Indian and later Punjabi MC (whose collaboration with Jay-Z reached mainstream audiences) helped bring Bhangra to global attention."
  },

  // ── EAST ASIAN GENRES ─────────────────────────────────────────────────────

  'k-pop': {
    lineage: [
      { name: 'American R&B and pop', description: "K-Pop absorbed American R&B, hip-hop, and pop production aesthetics in the 1990s." },
      { name: 'J-Pop', description: "Japanese pop music was an early influence on Korean pop." },
      { name: 'Korean trot', description: "Trot — traditional Korean popular music — provides some melodic sensibilities." }
    ],
    culturalContext: "K-Pop emerged as a deliberate cultural industry creation in South Korea in the 1990s, shaped by the three major labels SM, YG, and JYP. Through groups like BTS, BLACKPINK, and EXO, it has become a global phenomenon — representing both Korean soft power and a carefully engineered entertainment system that raises questions about artistic labour and authenticity."
  },

  'j-pop': {
    lineage: [
      { name: 'Western pop and rock', description: "J-Pop absorbed Western pop, rock, and electronic influences in the post-war era." },
      { name: 'Enka', description: "Japanese Enka — melancholic traditional pop — provides emotional depth to J-Pop." },
      { name: 'Shibuya-kei', description: "The sophisticated, sample-heavy Shibuya-kei scene influenced contemporary J-Pop production." }
    ],
    culturalContext: "Japanese popular music has a rich history of absorbing and transforming Western influences into distinctly Japanese forms. J-Pop encompasses everything from idol music to city pop — the latter of which has had an extraordinary global revival through YouTube's algorithm connecting new audiences to 1980s Japanese pop."
  },

  // ── OTHER GLOBAL GENRES ───────────────────────────────────────────────────

  'folk-country': {
    lineage: [
      { name: 'Appalachian folk traditions', description: "Rooted in folk music brought by British and Irish immigrants to the Appalachian Mountains." },
      { name: 'Blues influence', description: "The influence of blues on country music is significant and complex." }
    ],
    culturalContext: "Folk and country music traditions document rural American life and reflect both European immigrant culture and the unavoidable influence of African American musical traditions in the American South."
  },

  'classical': {
    lineage: [
      { name: 'European classical tradition', description: "A 500-year Western tradition of formal composition, from Renaissance polyphony through baroque, classical, romantic, and modernist periods." }
    ],
    culturalContext: "Classical music's influence on AI is significant — much AI music training data includes classical recordings, and orchestral production techniques have diffused throughout popular music production, particularly through producers like Quincy Jones who bridged classical and pop."
  },

  'pop': {
    lineage: [
      { name: 'R&B and soul', description: 'Contemporary pop is overwhelmingly shaped by R&B production techniques and vocal styles.' },
      { name: 'Rock', description: "Rock's melodic directness and song structures feed into pop." },
      { name: 'Electronic production', description: 'Modern pop production is heavily electronic, drawing on dance music traditions.' }
    ],
    culturalContext: "Pop music is a synthesis — it draws from virtually every other musical tradition while often obscuring those origins. R&B and Black musical traditions in particular have been foundational to mainstream pop throughout its history."
  },

  'lo-fi': {
    lineage: [
      { name: 'Jazz', description: "Lo-fi hip hop samples jazz extensively — piano chords, upright bass, and brush drums." },
      { name: 'Hip-hop', description: "Lo-fi grew from hip-hop's tradition of sampling and beat-making." },
      { name: 'Chillwave', description: "The hazy, nostalgic aesthetic of chillwave influenced lo-fi's emotional texture." }
    ],
    culturalContext: "Lo-fi hip hop emerged as YouTube's 'study music' phenomenon in the 2010s, built on the aesthetics of imperfection — vinyl crackle, tape hiss, ambient sound. It has become a defining genre of the streaming era, raising questions about what 'music' means when millions of hours of it are consumed as productive background."
  },

  'city-pop': {
    lineage: [
      { name: 'Japanese pop', description: "City Pop emerged from Japanese pop in the late 1970s and 1980s." },
      { name: 'Yacht rock and AOR', description: "American yacht rock and adult-oriented rock aesthetics heavily influenced City Pop's smooth production." },
      { name: 'Funk and soul', description: "Funk grooves and soul vocal aesthetics run through City Pop." }
    ],
    culturalContext: "City Pop was the soundtrack of Japan's economic boom in the 1980s — optimistic, sophisticated, urban. Artists like Mariya Takeuchi, Tatsuro Yamashita, and Anri defined a sound associated with the glamour of 1980s Tokyo. Its extraordinary global revival in the 2010s and 2020s through YouTube and algorithms introduced a new generation to this music."
  },

  'afrojuju': {
    lineage: [
      { name: 'Jùjú music', description: "Afrojuju draws from the Yoruba jùjú tradition — praise singing with talking drums and guitar." },
      { name: 'Afrobeats', description: "Contemporary Afrobeats production sensibilities update the jùjú tradition." }
    ],
    culturalContext: "Jùjú music is a Yoruba popular music tradition from Nigeria, developed by King Sunny Ade and Ebenezer Obey into a sophisticated, guitar-driven genre with talking drums and praise singing. It is one of the foundations of contemporary Afrobeats."
  },

  'gospel-rap': {
    lineage: [
      { name: 'Gospel music', description: "Gospel rap takes the spiritual message and emotional intensity of gospel music." },
      { name: 'Hip-hop', description: "The production aesthetics, flows, and street credibility of hip-hop are central to gospel rap." }
    ],
    culturalContext: "Gospel rap — also known as Christian hip-hop or holy hip-hop — has been a significant genre since the 1990s, with artists like DC Talk, Lecrae, and Kanye West (on his gospel albums) demonstrating its cultural reach. It represents the ongoing relationship between Black American sacred and secular musical traditions."
  },

  'grime': {
    lineage: [
      { name: 'UK Garage', description: "Grime evolved from the faster, more aggressive end of UK Garage." },
      { name: 'Dancehall', description: "Jamaican dancehall's toasting tradition and sound system culture influenced grime's MC culture." },
      { name: 'Drum and Bass', description: "D&B's tempo and energy fed into grime's aggressive pace." }
    ],
    culturalContext: "Grime emerged from East London in the early 2000s, created by young Black British artists from the Afro-Caribbean diaspora. Artists like Dizzee Rascal, Wiley, and Stormzy brought working-class British experience — particularly the experience of young Black men in London — into a powerful musical form that has influenced global pop and hip-hop."
  },

  'soca': {
    lineage: [
      { name: 'Calypso', description: "Soca evolved from Calypso — the politically charged, satirical music of Trinidad and Tobago." },
      { name: 'Indian chutney music', description: "Indian musical influences brought by indentured labourers to the Caribbean contributed to soca's rhythm." },
      { name: 'Funk and soul', description: "American funk and soul energised soca's production in the 1970s." }
    ],
    culturalContext: "Soca — Soul of Calypso — was created by Lord Shorty in Trinidad in the 1970s. It is the music of Caribbean carnival culture, designed for mass participation and celebration. Its influence has spread across the Caribbean diaspora and into global party music."
  }
};
