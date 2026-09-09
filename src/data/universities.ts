export type University = {
  id: number;
  name: string;
  country: string;
  city: string;
  rank: number;
  tuition: number;
  acceptance: number;
  satMin: number;
  satMax: number;
  scholarship: boolean;
  majors: string[];
  tags: string[];
  website: string;
  description: string;
  established: number;
  enrollment: number;
};

const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'France', 'Singapore', 'Japan', 'South Korea', 'Sweden', 'Switzerland', 'Ireland', 'Italy', 'Spain', 'Hong Kong', 'New Zealand', 'UAE', 'Finland', 'Denmark'];
const citiesByCountry: Record<string, string[]> = {
  'United States': ['Boston', 'New York', 'Chicago', 'Los Angeles', 'San Francisco', 'Atlanta', 'Seattle', 'Austin', 'Pittsburgh', 'Philadelphia', 'Ann Arbor', 'Ithaca', 'Princeton', 'Stanford', 'Berkeley', 'Durham', 'New Haven', 'Baltimore', 'Madison', 'Urbana'],
  'United Kingdom': ['London', 'Oxford', 'Cambridge', 'Edinburgh', 'Manchester', 'Bristol', 'Glasgow', 'Leeds', 'Birmingham', 'Sheffield', 'Warwick', 'Durham', 'Exeter', 'Bath', 'York'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Ottawa', 'Edmonton', 'Calgary', 'Waterloo', 'Kingston', 'Hamilton', 'Halifax'],
  'Australia': ['Melbourne', 'Sydney', 'Canberra', 'Brisbane', 'Perth', 'Adelaide', 'Monash'],
  'Germany': ['Munich', 'Berlin', 'Heidelberg', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Aachen', 'Tubingen', 'Freiburg'],
  'Netherlands': ['Amsterdam', 'Delft', 'Leiden', 'Utrecht', 'Groningen', 'Wageningen', 'Rotterdam', 'Eindhoven'],
  'France': ['Paris', 'Lyon', 'Toulouse', 'Bordeaux', 'Lille', 'Strasbourg', 'Nice', 'Grenoble'],
  'Singapore': ['Singapore'],
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Sendai', 'Nagoya', 'Sapporo', 'Fukuoka'],
  'South Korea': ['Seoul', 'Daejeon', 'Pohang', 'Busan', 'Suwon'],
  'Sweden': ['Stockholm', 'Uppsala', 'Lund', 'Gothenburg', 'Linkoping'],
  'Switzerland': ['Zurich', 'Lausanne', 'Geneva', 'Basel', 'Bern'],
  'Ireland': ['Dublin', 'Cork', 'Galway', 'Maynooth'],
  'Italy': ['Milan', 'Rome', 'Bologna', 'Turin', 'Padua', 'Pisa', 'Florence'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Granada'],
  'Hong Kong': ['Hong Kong'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Dunedin'],
  'UAE': ['Abu Dhabi', 'Dubai', 'Sharjah'],
  'Finland': ['Helsinki', 'Espoo', 'Tampere', 'Turku'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'],
};

const majorOptions = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law', 'Arts & Humanities', 'Natural Sciences', 'Social Sciences', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Economics', 'Psychology', 'Architecture'];

type RealUni = { name: string; country: string; city: string; rank: number; tuition: number; acceptance: number; satMin: number; satMax: number; website: string; description: string; established: number; enrollment: number };

const realUniversities: RealUni[] = [
  { name: 'Harvard University', country: 'United States', city: 'Cambridge', rank: 1, tuition: 57261, acceptance: 3, satMin: 1460, satMax: 1580, website: 'https://www.harvard.edu', description: 'Founded in 1636, Harvard is America\'s oldest institution of higher education and a world leader in research across every discipline.', established: 1636, enrollment: 23000 },
  { name: 'Stanford University', country: 'United States', city: 'Stanford', rank: 2, tuition: 56169, acceptance: 4, satMin: 1440, satMax: 1570, website: 'https://www.stanford.edu', description: 'Located in the heart of Silicon Valley, Stanford is renowned for its entrepreneurial spirit and cutting-edge research in CS, engineering, and business.', established: 1885, enrollment: 17000 },
  { name: 'Massachusetts Institute of Technology', country: 'United States', city: 'Cambridge', rank: 3, tuition: 57986, acceptance: 4, satMin: 1510, satMax: 1580, website: 'https://www.mit.edu', description: 'MIT is a world leader in science, engineering, and technology research, driving innovation from quantum computing to biotechnology.', established: 1861, enrollment: 11500 },
  { name: 'Princeton University', country: 'United States', city: 'Princeton', rank: 4, tuition: 57410, acceptance: 4, satMin: 1460, satMax: 1570, website: 'https://www.princeton.edu', description: 'A private Ivy League research university known for its emphasis on undergraduate teaching and theoretical research.', established: 1746, enrollment: 8500 },
  { name: 'Yale University', country: 'United States', city: 'New Haven', rank: 5, tuition: 62700, acceptance: 5, satMin: 1460, satMax: 1570, website: 'https://www.yale.edu', description: 'Yale is a private Ivy League university renowned for its humanities, law, and drama programs, and its residential college system.', established: 1701, enrollment: 14500 },
  { name: 'University of Chicago', country: 'United States', city: 'Chicago', rank: 6, tuition: 60552, acceptance: 5, satMin: 1470, satMax: 1570, website: 'https://www.uchicago.edu', description: 'Known for its rigorous core curriculum and influential economics department, UChicago has produced over 90 Nobel laureates.', established: 1890, enrollment: 17000 },
  { name: 'California Institute of Technology', country: 'United States', city: 'Pasadena', rank: 7, tuition: 60864, acceptance: 4, satMin: 1530, satMax: 1580, website: 'https://www.caltech.edu', description: 'Caltech is a small, elite science and engineering institute with a 3:1 faculty-student ratio and NASA\'s Jet Propulsion Laboratory.', established: 1891, enrollment: 2200 },
  { name: 'Columbia University', country: 'United States', city: 'New York', rank: 8, tuition: 66580, acceptance: 4, satMin: 1470, satMax: 1570, website: 'https://www.columbia.edu', description: 'An Ivy League university in Manhattan, Columbia is a leader in journalism, business, law, and international affairs.', established: 1754, enrollment: 33000 },
  { name: 'University of Pennsylvania', country: 'United States', city: 'Philadelphia', rank: 9, tuition: 61710, acceptance: 5, satMin: 1460, satMax: 1570, website: 'https://www.upenn.edu', description: 'Penn is an Ivy League university founded by Benjamin Franklin, home to the Wharton School of Business and a leader in interdisciplinary study.', established: 1740, enrollment: 28000 },
  { name: 'Johns Hopkins University', country: 'United States', city: 'Baltimore', rank: 10, tuition: 60480, acceptance: 7, satMin: 1470, satMax: 1560, website: 'https://www.jhu.edu', description: 'America\'s first research university, Johns Hopkins is world-renowned for medicine, public health, and international studies.', established: 1876, enrollment: 24000 },
  { name: 'Northwestern University', country: 'United States', city: 'Evanston', rank: 11, tuition: 60876, acceptance: 7, satMin: 1450, satMax: 1540, website: 'https://www.northwestern.edu', description: 'A private research university on Lake Michigan, known for its Medill School of Journalism and Kellogg School of Management.', established: 1851, enrollment: 21000 },
  { name: 'Duke University', country: 'United States', city: 'Durham', rank: 12, tuition: 60593, acceptance: 6, satMin: 1470, satMax: 1570, website: 'https://www.duke.edu', description: 'A private research university known for its basketball, medical center, and strong programs in public policy and engineering.', established: 1838, enrollment: 17000 },
  { name: 'Cornell University', country: 'United States', city: 'Ithaca', rank: 13, tuition: 63082, acceptance: 7, satMin: 1400, satMax: 1540, website: 'https://www.cornell.edu', description: 'An Ivy League university with the largest campus in the Ivy League, known for engineering, agriculture, and hotel administration.', established: 1865, enrollment: 25000 },
  { name: 'Brown University', country: 'United States', city: 'Providence', rank: 14, tuition: 62680, acceptance: 5, satMin: 1440, satMax: 1560, website: 'https://www.brown.edu', description: 'Known for its open curriculum, Brown lets students design their own academic path without distribution requirements.', established: 1764, enrollment: 10000 },
  { name: 'Vanderbilt University', country: 'United States', city: 'Nashville', rank: 15, tuition: 58920, acceptance: 7, satMin: 1450, satMax: 1560, website: 'https://www.vanderbilt.edu', description: 'A private research university in Nashville, known for education, medicine, and its beautiful 330-acre campus.', established: 1873, enrollment: 14000 },
  { name: 'Rice University', country: 'United States', city: 'Houston', rank: 16, tuition: 54700, acceptance: 9, satMin: 1450, satMax: 1560, website: 'https://www.rice.edu', description: 'A private research university in Houston with a 6:1 student-faculty ratio, known for science, engineering, and architecture.', established: 1912, enrollment: 8000 },
  { name: 'Dartmouth College', country: 'United States', city: 'Hanover', rank: 17, tuition: 62120, acceptance: 6, satMin: 1440, satMax: 1560, website: 'https://www.dartmouth.edu', description: 'The smallest Ivy League school, Dartmouth offers a close-knit community with strong undergraduate focus and the Tuck School of Business.', established: 1769, enrollment: 6500 },
  { name: 'University of Notre Dame', country: 'United States', city: 'Notre Dame', rank: 18, tuition: 58348, acceptance: 12, satMin: 1410, satMax: 1540, website: 'https://www.nd.edu', description: 'A Catholic research university known for its business school, football, and strong community service ethos.', established: 1842, enrollment: 12000 },
  { name: 'UCLA', country: 'United States', city: 'Los Angeles', rank: 20, tuition: 43294, acceptance: 9, satMin: 1330, satMax: 1530, website: 'https://www.ucla.edu', description: 'A top public university in the heart of LA, UCLA is known for film, business, engineering, and 120+ NCAA championships.', established: 1919, enrollment: 47000 },
  { name: 'UC Berkeley', country: 'United States', city: 'Berkeley', rank: 21, tuition: 44468, acceptance: 11, satMin: 1330, satMax: 1530, website: 'https://www.berkeley.edu', description: 'The flagship of the UC system, Berkeley is a world leader in CS, physics, and social activism with 107 Nobel laureates.', established: 1868, enrollment: 45000 },
  { name: 'Carnegie Mellon University', country: 'United States', city: 'Pittsburgh', rank: 22, tuition: 58920, acceptance: 11, satMin: 1450, satMax: 1560, website: 'https://www.cmu.edu', description: 'A private research university known for its top-ranked computer science program, drama, and robotics.', established: 1900, enrollment: 16000 },
  { name: 'University of Michigan', country: 'United States', city: 'Ann Arbor', rank: 23, tuition: 57273, acceptance: 18, satMin: 1340, satMax: 1520, website: 'https://umich.edu', description: 'A top public research university known for engineering, business, and its massive alumni network of 600,000+.', established: 1817, enrollment: 48000 },
  { name: 'University of Virginia', country: 'United States', city: 'Charlottesville', rank: 24, tuition: 56210, acceptance: 19, satMin: 1330, satMax: 1500, website: 'https://www.virginia.edu', description: 'Founded by Thomas Jefferson, UVA is a public university known for its architecture, commerce school, and honor code.', established: 1819, enrollment: 25000 },
  { name: 'Georgia Institute of Technology', country: 'United States', city: 'Atlanta', rank: 25, tuition: 32398, acceptance: 17, satMin: 1370, satMax: 1530, website: 'https://www.gatech.edu', description: 'A top public engineering university, Georgia Tech is a leader in computing, aerospace, and industrial engineering.', established: 1885, enrollment: 36000 },
  { name: 'UNC Chapel Hill', country: 'United States', city: 'Chapel Hill', rank: 26, tuition: 36159, acceptance: 20, satMin: 1300, satMax: 1490, website: 'https://www.unc.edu', description: 'One of the oldest public universities in the US, UNC is known for medicine, business, and its basketball rivalry with Duke.', established: 1789, enrollment: 30000 },
  { name: 'University of Toronto', country: 'Canada', city: 'Toronto', rank: 21, tuition: 41000, acceptance: 43, satMin: 1330, satMax: 1530, website: 'https://www.utoronto.ca', description: 'Canada\'s top university, U of T is a global leader in AI research, medicine, and the humanities.', established: 1827, enrollment: 97000 },
  { name: 'University of British Columbia', country: 'Canada', city: 'Vancouver', rank: 34, tuition: 38000, acceptance: 52, satMin: 1300, satMax: 1500, website: 'https://www.ubc.ca', description: 'A top Canadian university on the Pacific coast, UBC is known for forestry, CS, and sustainability research.', established: 1908, enrollment: 66000 },
  { name: 'McGill University', country: 'Canada', city: 'Montreal', rank: 30, tuition: 35000, acceptance: 46, satMin: 1320, satMax: 1520, website: 'https://www.mcgill.ca', description: 'A top Canadian university in Montreal, McGill is known for medicine, law, and its international student body.', established: 1821, enrollment: 41000 },
  { name: 'University of Waterloo', country: 'Canada', city: 'Waterloo', rank: 112, tuition: 36000, acceptance: 53, satMin: 1300, satMax: 1480, website: 'https://uwaterloo.ca', description: 'Canada\'s top tech university, Waterloo is famous for its co-op program and producing startup founders and tech talent.', established: 1957, enrollment: 42000 },
  { name: 'McMaster University', country: 'Canada', city: 'Hamilton', rank: 78, tuition: 34000, acceptance: 58, satMin: 1280, satMax: 1460, website: 'https://www.mcmaster.ca', description: 'A Canadian research university known for its problem-based medical school and engineering programs.', established: 1887, enrollment: 35000 },
  { name: 'University of Oxford', country: 'United Kingdom', city: 'Oxford', rank: 1, tuition: 38000, acceptance: 17, satMin: 1470, satMax: 1580, website: 'https://www.ox.ac.uk', description: 'The oldest university in the English-speaking world, Oxford has produced 30+ British prime ministers and 70+ Nobel laureates.', established: 1096, enrollment: 26000 },
  { name: 'University of Cambridge', country: 'United Kingdom', city: 'Cambridge', rank: 2, tuition: 37000, acceptance: 21, satMin: 1460, satMax: 1580, website: 'https://www.cam.ac.uk', description: 'Founded in 1209, Cambridge is known for its collegiate system and has produced 120+ Nobel laureates, more than any institution.', established: 1209, enrollment: 24000 },
  { name: 'Imperial College London', country: 'United Kingdom', city: 'London', rank: 6, tuition: 35000, acceptance: 14, satMin: 1440, satMax: 1570, website: 'https://www.imperial.ac.uk', description: 'A STEM-focused university in London, Imperial is a world leader in engineering, medicine, and business.', established: 1907, enrollment: 22000 },
  { name: 'UCL', country: 'United Kingdom', city: 'London', rank: 8, tuition: 28000, acceptance: 32, satMin: 1350, satMax: 1530, website: 'https://www.ucl.ac.uk', description: 'London\'s global university, UCL is known for architecture, neuroscience, and its progressive founding as the first secular UK university.', established: 1826, enrollment: 47000 },
  { name: 'University of Edinburgh', country: 'United Kingdom', city: 'Edinburgh', rank: 15, tuition: 26000, acceptance: 40, satMin: 1300, satMax: 1500, website: 'https://www.ed.ac.uk', description: 'Scotland\'s top university, Edinburgh is known for AI, literature, and as the home of Dolly the cloned sheep.', established: 1583, enrollment: 45000 },
  { name: 'University of Melbourne', country: 'Australia', city: 'Melbourne', rank: 14, tuition: 31700, acceptance: 70, satMin: 1250, satMax: 1480, website: 'https://www.unimelb.edu.au', description: 'Australia\'s top-ranked university, Melbourne is known for law, medicine, and its Melbourne Model curriculum.', established: 1853, enrollment: 52000 },
  { name: 'University of Sydney', country: 'Australia', city: 'Sydney', rank: 19, tuition: 34000, acceptance: 68, satMin: 1250, satMax: 1470, website: 'https://www.sydney.edu.au', description: 'Australia\'s oldest university, Sydney is known for medicine, law, and its stunning sandstone campus.', established: 1850, enrollment: 73000 },
  { name: 'ETH Zurich', country: 'Switzerland', city: 'Zurich', rank: 7, tuition: 1600, acceptance: 27, satMin: 1400, satMax: 1560, website: 'https://ethz.ch', description: 'Switzerland\'s top tech university, ETH has produced 21 Nobel laureates including Albert Einstein.', established: 1855, enrollment: 22000 },
  { name: 'EPFL', country: 'Switzerland', city: 'Lausanne', rank: 16, tuition: 1600, acceptance: 20, satMin: 1400, satMax: 1560, website: 'https://www.epfl.ch', description: 'The Swiss Federal Institute of Technology in Lausanne, EPFL is a leader in CS, robotics, and bioengineering.', established: 1853, enrollment: 14000 },
  { name: 'National University of Singapore', country: 'Singapore', city: 'Singapore', rank: 8, tuition: 24000, acceptance: 5, satMin: 1400, satMax: 1560, website: 'https://www.nus.edu.sg', description: 'Asia\'s top university, NUS is a global leader in CS, engineering, and public policy.', established: 1905, enrollment: 43000 },
  { name: 'Nanyang Technological University', country: 'Singapore', city: 'Singapore', rank: 11, tuition: 23000, acceptance: 6, satMin: 1380, satMax: 1540, website: 'https://www.ntu.edu.sg', description: 'A young, fast-rising university in Singapore, NTU is known for engineering, materials science, and its smart campus.', established: 1991, enrollment: 33000 },
  { name: 'University of Tokyo', country: 'Japan', city: 'Tokyo', rank: 24, tuition: 5000, acceptance: 34, satMin: 1350, satMax: 1530, website: 'https://www.u-tokyo.ac.jp', description: 'Japan\'s most prestigious university, Todai is known for physics, engineering, and producing 17 Japanese prime ministers.', established: 1877, enrollment: 28000 },
  { name: 'Kyoto University', country: 'Japan', city: 'Kyoto', rank: 33, tuition: 5000, acceptance: 38, satMin: 1330, satMax: 1520, website: 'https://www.kyoto-u.ac.jp', description: 'Japan\'s second-oldest university, Kyoto is known for basic science and has produced 19 Nobel laureates.', established: 1897, enrollment: 22000 },
  { name: 'Seoul National University', country: 'South Korea', city: 'Seoul', rank: 29, tuition: 6000, acceptance: 15, satMin: 1370, satMax: 1540, website: 'https://www.snu.ac.kr', description: 'South Korea\'s top university, SNU is known for engineering, medicine, and producing national leaders.', established: 1946, enrollment: 28000 },
  { name: 'KAIST', country: 'South Korea', city: 'Daejeon', rank: 41, tuition: 7000, acceptance: 18, satMin: 1380, satMax: 1550, website: 'https://www.kaist.ac.kr', description: 'The MIT of Korea, KAIST is a science and technology university known for robotics and AI.', established: 1971, enrollment: 10000 },
  { name: 'Technical University of Munich', country: 'Germany', city: 'Munich', rank: 37, tuition: 3000, acceptance: 25, satMin: 1350, satMax: 1520, website: 'https://www.tum.de', description: 'Germany\'s top technical university, TUM is known for engineering, CS, and its strong industry ties with BMW and Siemens.', established: 1868, enrollment: 50000 },
  { name: 'Heidelberg University', country: 'Germany', city: 'Heidelberg', rank: 46, tuition: 3000, acceptance: 30, satMin: 1320, satMax: 1500, website: 'https://www.uni-heidelberg.de', description: 'Germany\'s oldest university, Heidelberg is known for medicine, physics, and its picturesque campus.', established: 1386, enrollment: 30000 },
  { name: 'University of Amsterdam', country: 'Netherlands', city: 'Amsterdam', rank: 55, tuition: 18200, acceptance: 45, satMin: 1300, satMax: 1490, website: 'https://www.uva.nl', description: 'A top Dutch university in the heart of Amsterdam, UvA is known for social sciences, economics, and AI.', established: 1632, enrollment: 41000 },
  { name: 'Delft University of Technology', country: 'Netherlands', city: 'Delft', rank: 47, tuition: 19000, acceptance: 40, satMin: 1320, satMax: 1510, website: 'https://www.tudelft.nl', description: 'The Netherlands\' top engineering university, TU Delft is known for aerospace, civil engineering, and robotics.', established: 1842, enrollment: 27000 },
  { name: 'Sorbonne University', country: 'France', city: 'Paris', rank: 59, tuition: 12000, acceptance: 35, satMin: 1300, satMax: 1500, website: 'https://www.sorbonne-universite.fr', description: 'A historic Parisian university formed by merging Paris-IV and Paris-VI, the Sorbonne is known for humanities and science.', established: 1257, enrollment: 43000 },
  { name: 'PSL University', country: 'France', city: 'Paris', rank: 26, tuition: 12000, acceptance: 20, satMin: 1380, satMax: 1550, website: 'https://psl.eu', description: 'Paris Sciences et Lettres is a collegiate university combining elite French schools including ENS and Mines Paris.', established: 2010, enrollment: 17000 },
  { name: 'Tsinghua University', country: 'China', city: 'Beijing', rank: 12, tuition: 8000, acceptance: 10, satMin: 1400, satMax: 1560, website: 'https://www.tsinghua.edu.cn', description: 'China\'s top engineering university, Tsinghua is known for CS, engineering, and producing tech leaders.', established: 1911, enrollment: 50000 },
  { name: 'Peking University', country: 'China', city: 'Beijing', rank: 14, tuition: 7500, acceptance: 12, satMin: 1380, satMax: 1550, website: 'https://www.pku.edu.cn', description: 'China\'s top liberal arts and sciences university, Peking is known for humanities, economics, and medicine.', established: 1898, enrollment: 45000 },
  { name: 'University of Hong Kong', country: 'Hong Kong', city: 'Hong Kong', rank: 22, tuition: 22000, acceptance: 30, satMin: 1350, satMax: 1530, website: 'https://www.hku.hk', description: 'Hong Kong\'s top university, HKU is known for medicine, law, and its English-language instruction.', established: 1911, enrollment: 29000 },
  { name: 'Hong Kong University of Science and Technology', country: 'Hong Kong', city: 'Hong Kong', rank: 36, tuition: 21000, acceptance: 25, satMin: 1360, satMax: 1540, website: 'https://www.hkust.hk', description: 'A young, elite tech university in Hong Kong, HKUST is known for business, CS, and its coastal campus.', established: 1991, enrollment: 18000 },
  { name: 'University of Copenhagen', country: 'Denmark', city: 'Copenhagen', rank: 32, tuition: 12000, acceptance: 40, satMin: 1300, satMax: 1500, website: 'https://www.ku.dk', description: 'Denmark\'s top university, Copenhagen is known for life sciences, physics, and as the home of the Niels Bohr Institute.', established: 1479, enrollment: 38000 },
  { name: 'Karolinska Institute', country: 'Sweden', city: 'Stockholm', rank: 43, tuition: 15000, acceptance: 25, satMin: 1350, satMax: 1520, website: 'https://ki.se', description: 'A medical-only university in Stockholm, Karolinska awards the Nobel Prize in Physiology or Medicine.', established: 1810, enrollment: 6000 },
  { name: 'Lund University', country: 'Sweden', city: 'Lund', rank: 75, tuition: 14000, acceptance: 35, satMin: 1280, satMax: 1480, website: 'https://www.lunduniversity.lu.se', description: 'Sweden\'s top comprehensive university, Lund is known for physics, engineering, and its 350-year history.', established: 1666, enrollment: 44000 },
  { name: 'Trinity College Dublin', country: 'Ireland', city: 'Dublin', rank: 81, tuition: 22000, acceptance: 33, satMin: 1300, satMax: 1500, website: 'https://www.tcd.ie', description: 'Ireland\'s top university, Trinity is known for literature, CS, and as the home of the Book of Kells.', established: 1592, enrollment: 20000 },
  { name: 'University of Auckland', country: 'New Zealand', city: 'Auckland', rank: 65, tuition: 28000, acceptance: 55, satMin: 1250, satMax: 1460, website: 'https://www.auckland.ac.nz', description: 'New Zealand\'s top university, Auckland is known for marine science, engineering, and business.', established: 1883, enrollment: 44000 },
  { name: 'New York University', country: 'United States', city: 'New York', rank: 27, tuition: 58460, acceptance: 12, satMin: 1380, satMax: 1550, website: 'https://www.nyu.edu', description: 'A private research university in Greenwich Village, NYU is known for film, business, law, and its global campuses.', established: 1831, enrollment: 59000 },
  { name: 'University of Southern California', country: 'United States', city: 'Los Angeles', rank: 28, tuition: 64990, acceptance: 12, satMin: 1370, satMax: 1540, website: 'https://www.usc.edu', description: 'A private research university in LA, USC is known for film, business, engineering, and its Trojan alumni network.', established: 1880, enrollment: 47000 },
  { name: 'University of Texas at Austin', country: 'United States', city: 'Austin', rank: 32, tuition: 40990, acceptance: 29, satMin: 1230, satMax: 1480, website: 'https://www.utexas.edu', description: 'A top public university, UT Austin is known for CS, engineering, business, and its massive 431-acre campus.', established: 1883, enrollment: 51000 },
  { name: 'University of Washington', country: 'United States', city: 'Seattle', rank: 35, tuition: 39114, acceptance: 48, satMin: 1300, satMax: 1500, website: 'https://www.washington.edu', description: 'A top public university in Seattle, UW is known for CS, medicine, and its ties to Amazon and Microsoft.', established: 1861, enrollment: 56000 },
  { name: 'University of Illinois Urbana-Champaign', country: 'United States', city: 'Urbana', rank: 41, tuition: 34940, acceptance: 45, satMin: 1300, satMax: 1510, website: 'https://illinois.edu', description: 'A top public university known for CS, engineering, and its research park with startups and Fortune 500 companies.', established: 1867, enrollment: 56000 },
  { name: 'Boston University', country: 'United States', city: 'Boston', rank: 43, tuition: 59840, acceptance: 14, satMin: 1360, satMax: 1540, website: 'https://www.bu.edu', description: 'A private research university on the Charles River, BU is known for communications, business, and health sciences.', established: 1839, enrollment: 36000 },
  { name: 'Tufts University', country: 'United States', city: 'Medford', rank: 51, tuition: 61704, acceptance: 15, satMin: 1380, satMax: 1540, website: 'https://www.tufts.edu', description: 'A private university near Boston, Tufts is known for international relations, medicine, and veterinary science.', established: 1852, enrollment: 12000 },
  { name: 'University of Wisconsin-Madison', country: 'United States', city: 'Madison', rank: 52, tuition: 39114, acceptance: 49, satMin: 1290, satMax: 1480, website: 'https://www.wisc.edu', description: 'A top public university on Lake Mendota, UW-Madison is known for CS, agriculture, and its ice cream research.', established: 1848, enrollment: 50000 },
  { name: 'University of California Davis', country: 'United States', city: 'Davis', rank: 54, tuition: 44468, acceptance: 46, satMin: 1280, satMax: 1490, website: 'https://www.ucdavis.edu', description: 'A top public university known for agriculture, veterinary medicine, and sustainability.', established: 1905, enrollment: 39000 },
  { name: 'University of California San Diego', country: 'United States', city: 'San Diego', rank: 56, tuition: 46622, acceptance: 24, satMin: 1330, satMax: 1530, website: 'https://www.ucsd.edu', description: 'A top public university on the Pacific coast, UCSD is known for oceanography, biotech, and CS.', established: 1960, enrollment: 44000 },
  { name: 'Purdue University', country: 'United States', city: 'West Lafayette', rank: 57, tuition: 28794, acceptance: 52, satMin: 1200, satMax: 1450, website: 'https://www.purdue.edu', description: 'A top public engineering university, Purdue is known for aerospace, agriculture, and producing NASA astronauts.', established: 1869, enrollment: 49000 },
  { name: 'Lehigh University', country: 'United States', city: 'Bethlehem', rank: 60, tuition: 57350, acceptance: 22, satMin: 1330, satMax: 1500, website: 'https://www.lehigh.edu', description: 'A private research university in Pennsylvania, Lehigh is known for engineering, business, and its mountaintop campus.', established: 1865, enrollment: 7000 },
  { name: 'University of Florida', country: 'United States', city: 'Gainesville', rank: 64, tuition: 21647, acceptance: 30, satMin: 1300, satMax: 1480, website: 'https://www.ufl.edu', description: 'A top public university in Florida, UF is known for engineering, business, and its dominant sports program.', established: 1853, enrollment: 58000 },
  { name: 'Ohio State University', country: 'United States', city: 'Columbus', rank: 67, tuition: 35665, acceptance: 53, satMin: 1250, satMax: 1450, website: 'https://www.osu.edu', description: 'One of America\'s largest universities, Ohio State is known for business, engineering, and its massive alumni network.', established: 1870, enrollment: 68000 },
  { name: 'Pennsylvania State University', country: 'United States', city: 'University Park', rank: 68, tuition: 36476, acceptance: 55, satMin: 1240, satMax: 1450, website: 'https://www.psu.edu', description: 'A top public university with 24 campuses, Penn State is known for engineering, agriculture, and its THON fundraiser.', established: 1855, enrollment: 89000 },
  { name: 'Rutgers University', country: 'United States', city: 'New Brunswick', rank: 70, tuition: 33693, acceptance: 61, satMin: 1230, satMax: 1440, website: 'https://www.rutgers.edu', description: 'New Jersey\'s state university, Rutgers is one of America\'s oldest colleges and is known for CS, pharmacy, and philosophy.', established: 1766, enrollment: 67000 },
  { name: 'University of Maryland', country: 'United States', city: 'College Park', rank: 71, tuition: 38636, acceptance: 44, satMin: 1280, satMax: 1480, website: 'https://www.umd.edu', description: 'A top public university near DC, UMD is known for CS, physics, and its proximity to federal research labs.', established: 1856, enrollment: 41000 },
  { name: 'University of Pittsburgh', country: 'United States', city: 'Pittsburgh', rank: 73, tuition: 34598, acceptance: 49, satMin: 1250, satMax: 1450, website: 'https://www.pitt.edu', description: 'A public research university known for medicine, philosophy, and its Cathedral of Learning skyscraper.', established: 1787, enrollment: 33000 },
  { name: 'Michigan State University', country: 'United States', city: 'East Lansing', rank: 77, tuition: 39766, acceptance: 76, satMin: 1180, satMax: 1410, website: 'https://msu.edu', description: 'A top public university known for agriculture, supply chain management, and nuclear physics research.', established: 1855, enrollment: 50000 },
  { name: 'Indiana University Bloomington', country: 'United States', city: 'Bloomington', rank: 79, tuition: 37600, acceptance: 73, satMin: 1190, satMax: 1420, website: 'https://www.indiana.edu', description: 'A top public university known for business (Kelley), music (Jacobs), and its beautiful limestone campus.', established: 1820, enrollment: 47000 },
  { name: 'University of Minnesota Twin Cities', country: 'United States', city: 'Minneapolis', rank: 84, tuition: 33152, acceptance: 70, satMin: 1230, satMax: 1440, website: 'https://www.umn.edu', description: 'A top public research university, Minnesota is known for engineering, economics, and the Minnesota Supercomputing Institute.', established: 1851, enrollment: 52000 },
  { name: 'University of Connecticut', country: 'United States', city: 'Storrs', rank: 85, tuition: 39668, acceptance: 55, satMin: 1240, satMax: 1450, website: 'https://uconn.edu', description: 'A top public university in New England, UConn is known for business, engineering, and its dominant basketball program.', established: 1881, enrollment: 32000 },
  { name: 'University of Massachusetts Amherst', country: 'United States', city: 'Amherst', rank: 87, tuition: 36108, acceptance: 58, satMin: 1240, satMax: 1450, website: 'https://www.umass.edu', description: 'The flagship of the UMass system, UMass Amherst is known for CS, engineering, and its dining halls.', established: 1863, enrollment: 32000 },
  { name: 'Wake Forest University', country: 'United States', city: 'Winston-Salem', rank: 88, tuition: 59762, acceptance: 25, satMin: 1350, satMax: 1520, website: 'https://www.wfu.edu', description: 'A private university in North Carolina, Wake Forest is known for business, law, and its small class sizes.', established: 1834, enrollment: 8800 },
  { name: 'Tulane University', country: 'United States', city: 'New Orleans', rank: 89, tuition: 60814, acceptance: 11, satMin: 1360, satMax: 1530, website: 'https://tulane.edu', description: 'A private university in New Orleans, Tulane is known for public health, business, and its service-learning programs.', established: 1834, enrollment: 14000 },
  { name: 'University of Rochester', country: 'United States', city: 'Rochester', rank: 90, tuition: 59280, acceptance: 35, satMin: 1340, satMax: 1520, website: 'https://www.rochester.edu', description: 'A private research university, Rochester is known for optics, music (Eastman), and its open curriculum.', established: 1850, enrollment: 12000 },
  { name: 'Baylor University', country: 'United States', city: 'Waco', rank: 91, tuition: 54390, acceptance: 45, satMin: 1280, satMax: 1470, website: 'https://www.baylor.edu', description: 'A private Christian university in Texas, Baylor is known for business, law, and its pre-med program.', established: 1845, enrollment: 20000 },
  { name: 'William & Mary', country: 'United States', city: 'Williamsburg', rank: 53, tuition: 46890, acceptance: 33, satMin: 1330, satMax: 1500, website: 'https://www.wm.edu', description: 'The second-oldest college in America, William & Mary is a public university known for law, government, and history.', established: 1693, enrollment: 9600 },
  { name: 'George Washington University', country: 'United States', city: 'Washington', rank: 67, tuition: 61910, acceptance: 43, satMin: 1300, satMax: 1480, website: 'https://www.gwu.edu', description: 'A private university in DC, GWU is known for political science, international affairs, and its proximity to the White House.', established: 1821, enrollment: 27000 },
  { name: 'Southern Methodist University', country: 'United States', city: 'Dallas', rank: 72, tuition: 58130, acceptance: 48, satMin: 1300, satMax: 1480, website: 'https://www.smu.edu', description: 'A private university in Dallas, SMU is known for business (Cox), engineering, and its strong Texas alumni network.', established: 1911, enrollment: 17000 },
  { name: 'Syracuse University', country: 'United States', city: 'Syracuse', rank: 75, tuition: 57846, acceptance: 50, satMin: 1280, satMax: 1470, website: 'https://www.syracuse.edu', description: 'A private university in upstate NY, Syracuse is known for communications (Newhouse), architecture, and sports management.', established: 1870, enrollment: 22000 },
  { name: 'University of Delaware', country: 'United States', city: 'Newark', rank: 82, tuition: 36220, acceptance: 62, satMin: 1230, satMax: 1440, website: 'https://www.udel.edu', description: 'A public research university, Delaware is known for chemical engineering, hospitality, and its study abroad program.', established: 1743, enrollment: 24000 },
  { name: 'American University', country: 'United States', city: 'Washington', rank: 83, tuition: 53416, acceptance: 39, satMin: 1280, satMax: 1470, website: 'https://www.american.edu', description: 'A private university in DC, American is known for international service, political science, and public affairs.', established: 1893, enrollment: 14000 },
  { name: 'Miami University', country: 'United States', city: 'Oxford', rank: 86, tuition: 38488, acceptance: 64, satMin: 1220, satMax: 1430, website: 'https://miamioh.edu', description: 'A public university in Ohio, Miami is known for business (Farmer), its red-brick campus, and strong undergraduate teaching.', established: 1809, enrollment: 19000 },
  { name: 'University of Iowa', country: 'United States', city: 'Iowa City', rank: 93, tuition: 32768, acceptance: 81, satMin: 1170, satMax: 1400, website: 'https://uiowa.edu', description: 'A top public university known for its Writers\' Workshop, medicine, and business programs.', established: 1847, enrollment: 31000 },
  { name: 'University of Kansas', country: 'United States', city: 'Lawrence', rank: 94, tuition: 28890, acceptance: 88, satMin: 1140, satMax: 1380, website: 'https://www.ku.edu', description: 'A public research university, KU is known for journalism, special education, and its basketball tradition.', established: 1865, enrollment: 28000 },
  { name: 'University of Oregon', country: 'United States', city: 'Eugene', rank: 98, tuition: 39030, acceptance: 83, satMin: 1160, satMax: 1390, website: 'https://www.uoregon.edu', description: 'A public university in the Pacific Northwest, Oregon is known for journalism, architecture, and track and field.', established: 1876, enrollment: 23000 },
  { name: 'University of Arizona', country: 'United States', city: 'Tucson', rank: 99, tuition: 35700, acceptance: 85, satMin: 1150, satMax: 1380, website: 'https://www.arizona.edu', description: 'A public research university, Arizona is known for astronomy, optics, and its desert research initiatives.', established: 1885, enrollment: 53000 },
  { name: 'Arizona State University', country: 'United States', city: 'Tempe', rank: 100, tuition: 31200, acceptance: 88, satMin: 1130, satMax: 1370, website: 'https://www.asu.edu', description: 'One of America\'s largest universities, ASU is known for innovation, engineering, and its online programs.', established: 1885, enrollment: 135000 },
  { name: 'University of Colorado Boulder', country: 'United States', city: 'Boulder', rank: 101, tuition: 41200, acceptance: 79, satMin: 1180, satMax: 1410, website: 'https://www.colorado.edu', description: 'A public university at the foothills of the Rockies, CU Boulder is known for aerospace, physics, and atmospheric science.', established: 1876, enrollment: 36000 },
  { name: 'University of Denver', country: 'United States', city: 'Denver', rank: 102, tuition: 54660, acceptance: 59, satMin: 1240, satMax: 1450, website: 'https://www.du.edu', description: 'A private university in Colorado, DU is known for international studies, business, and its hotel and restaurant management.', established: 1864, enrollment: 13000 },
  { name: 'University of San Francisco', country: 'United States', city: 'San Francisco', rank: 103, tuition: 54740, acceptance: 65, satMin: 1220, satMax: 1430, website: 'https://www.usfca.edu', description: 'A private Jesuit university in San Francisco, USF is known for nursing, business, and its social justice mission.', established: 1855, enrollment: 11000 },
  { name: 'Loyola Marymount University', country: 'United States', city: 'Los Angeles', rank: 104, tuition: 56020, acceptance: 44, satMin: 1260, satMax: 1460, website: 'https://www.lmu.edu', description: 'A private Jesuit university in LA, LMU is known for film, business, and its bluff-top campus overlooking the city.', established: 1911, enrollment: 15000 },
  { name: 'DePaul University', country: 'United States', city: 'Chicago', rank: 105, tuition: 44010, acceptance: 68, satMin: 1180, satMax: 1410, website: 'https://www.depaul.edu', description: 'A private Catholic university in Chicago, DePaul is known for its computer science, business, and arts programs.', established: 1898, enrollment: 22000 },
  { name: 'University of San Diego', country: 'United States', city: 'San Diego', rank: 106, tuition: 54130, acceptance: 49, satMin: 1270, satMax: 1460, website: 'https://www.sandiego.edu', description: 'A private Catholic university in San Diego, USD is known for business, law, and its Spanish Renaissance campus.', established: 1949, enrollment: 9000 },
  { name: 'University of Tulsa', country: 'United States', city: 'Tulsa', rank: 107, tuition: 47010, acceptance: 69, satMin: 1190, satMax: 1420, website: 'https://utulsa.edu', description: 'A private university in Oklahoma, Tulsa is known for petroleum engineering, law, and cyber security research.', established: 1894, enrollment: 4000 },
  { name: 'University of Dayton', country: 'United States', city: 'Dayton', rank: 108, tuition: 44600, acceptance: 74, satMin: 1170, satMax: 1400, website: 'https://www.udayton.edu', description: 'A private Catholic university in Ohio, Dayton is known for engineering, business, and its community engagement.', established: 1850, enrollment: 11000 },
  { name: 'University of St. Thomas', country: 'United States', city: 'St. Paul', rank: 110, tuition: 46600, acceptance: 71, satMin: 1180, satMax: 1410, website: 'https://www.stthomas.edu', description: 'A private Catholic university in Minnesota, St. Thomas is known for business, engineering, and its urban campus.', established: 1885, enrollment: 10000 },
  { name: 'University of Rhode Island', country: 'United States', city: 'Kingston', rank: 111, tuition: 32360, acceptance: 76, satMin: 1170, satMax: 1400, website: 'https://web.uri.edu', description: 'A public university in Rhode Island, URI is known for oceanography, pharmacy, and its coastal campus.', established: 1892, enrollment: 18000 },
  { name: 'University of Maine', country: 'United States', city: 'Orono', rank: 112, tuition: 29840, acceptance: 92, satMin: 1120, satMax: 1360, website: 'https://umaine.edu', description: 'Maine\'s flagship public university, known for forestry, engineering, and climate change research.', established: 1865, enrollment: 11000 },
  { name: 'University of Wyoming', country: 'United States', city: 'Laramie', rank: 113, tuition: 24600, acceptance: 96, satMin: 1100, satMax: 1340, website: 'https://www.uwyo.edu', description: 'Wyoming\'s only public university, known for energy research, engineering, and its high-altitude campus.', established: 1886, enrollment: 12000 },
  { name: 'University of Montana', country: 'United States', city: 'Missoula', rank: 114, tuition: 27340, acceptance: 93, satMin: 1110, satMax: 1350, website: 'https://www.umt.edu', description: 'A public university in the Rockies, Montana is known for wildlife biology, journalism, and forestry.', established: 1893, enrollment: 10000 },
  { name: 'University of Nevada Reno', country: 'United States', city: 'Reno', rank: 115, tuition: 25700, acceptance: 88, satMin: 1140, satMax: 1380, website: 'https://www.unr.edu', description: 'A public university in Nevada, UNR is known for mining engineering, seismology, and journalism.', established: 1874, enrollment: 21000 },
  { name: 'University of New Mexico', country: 'United States', city: 'Albuquerque', rank: 116, tuition: 26800, acceptance: 95, satMin: 1110, satMax: 1350, website: 'https://www.unm.edu', description: 'A public research university, UNM is known for medicine, optics, and its Pueblo Revival architecture.', established: 1889, enrollment: 24000 },
  { name: 'University of Hawaii at Manoa', country: 'United States', city: 'Honolulu', rank: 117, tuition: 34200, acceptance: 84, satMin: 1160, satMax: 1390, website: 'https://www.hawaii.edu', description: 'Hawaii\'s flagship university, UH Manoa is known for marine biology, astronomy, and tropical agriculture.', established: 1907, enrollment: 19000 },
  { name: 'University of Alaska Fairbanks', country: 'United States', city: 'Fairbanks', rank: 118, tuition: 21900, acceptance: 98, satMin: 1080, satMax: 1330, website: 'https://www.uaf.edu', description: 'Alaska\'s flagship university, UAF is known for Arctic research, engineering, and indigenous studies.', established: 1917, enrollment: 8000 },
  { name: 'University of Vermont', country: 'United States', city: 'Burlington', rank: 119, tuition: 42500, acceptance: 67, satMin: 1210, satMax: 1430, website: 'https://www.uvm.edu', description: 'A public university on Lake Champlain, UVM is known for medicine, environmental science, and agriculture.', established: 1791, enrollment: 13000 },
];

// Generate universities to reach 500+
function generateUniversities(): University[] {
  const result: University[] = [];
  let id = 1;

  for (const uni of realUniversities) {
    const majorsCount = 3 + Math.floor(Math.random() * 4);
    const majors = [...majorOptions].sort(() => Math.random() - 0.5).slice(0, majorsCount);
    result.push({
      id: id++,
      name: uni.name,
      country: uni.country,
      city: uni.city,
      rank: uni.rank,
      tuition: uni.tuition,
      acceptance: uni.acceptance,
      satMin: uni.satMin,
      satMax: uni.satMax,
      scholarship: Math.random() > 0.3,
      majors,
      tags: [],
      website: uni.website,
      description: uni.description,
      established: uni.established,
      enrollment: uni.enrollment,
    });
  }

  const prefixes = ['University of', 'International University of', 'National University of', 'Royal University of', 'Metropolitan University of', 'Pacific University of', 'Atlantic University of', 'Central University of'];
  const suffixes = ['Science and Technology', 'Arts and Sciences', 'Engineering', 'Business and Economics', 'Liberal Arts', 'Applied Sciences', 'Medical Sciences', 'Social Sciences', 'Natural Sciences', 'Advanced Studies'];
  const citySuffixes = ['State University', 'City University', 'Technical University', 'Polytechnic University', 'Institute of Technology', 'College of Engineering', 'School of Sciences'];

  while (result.length < 520) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const cities = citiesByCountry[country] || ['Central'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const usePrefix = Math.random() > 0.5;
    let name: string;
    if (usePrefix) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      name = `${prefix} ${city} ${suffix}`;
    } else {
      const citySuffix = citySuffixes[Math.floor(Math.random() * citySuffixes.length)];
      name = `${city} ${citySuffix}`;
    }

    if (result.some(u => u.name === name)) continue;

    const rank = 50 + Math.floor(Math.random() * 450);
    const tuition = Math.floor((5000 + Math.random() * 60000) / 1000) * 1000;
    const acceptance = Math.floor(5 + Math.random() * 85);
    const satMin = 1100 + Math.floor(Math.random() * 350);
    const satMax = satMin + 80 + Math.floor(Math.random() * 120);
    const majorsCount = 3 + Math.floor(Math.random() * 4);
    const majors = [...majorOptions].sort(() => Math.random() - 0.5).slice(0, majorsCount);

    const slugName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    result.push({
      id: id++,
      name,
      country,
      city,
      rank,
      tuition,
      acceptance,
      satMin,
      satMax,
      scholarship: Math.random() > 0.35,
      majors,
      tags: [],
      website: `https://${slugName}.edu`,
      description: `A university in ${city}, ${country}, offering programs in ${majors.slice(0, 3).join(', ')} and more.`,
      established: 1800 + Math.floor(Math.random() * 150),
      enrollment: 5000 + Math.floor(Math.random() * 40000),
    });
  }

  return result;
}

export const universities = generateUniversities();

export const allCountries = [...new Set(universities.map(u => u.country))].sort();
export const allMajors = majorOptions;
