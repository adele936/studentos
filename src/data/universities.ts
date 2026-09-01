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

const realUniversities: { name: string; country: string; city: string; rank: number; tuition: number; acceptance: number; satMin: number; satMax: number }[] = [
  { name: 'Harvard University', country: 'United States', city: 'Cambridge', rank: 1, tuition: 57261, acceptance: 3, satMin: 1460, satMax: 1580 },
  { name: 'Stanford University', country: 'United States', city: 'Stanford', rank: 2, tuition: 56169, acceptance: 4, satMin: 1440, satMax: 1570 },
  { name: 'Massachusetts Institute of Technology', country: 'United States', city: 'Cambridge', rank: 3, tuition: 57986, acceptance: 4, satMin: 1510, satMax: 1580 },
  { name: 'Princeton University', country: 'United States', city: 'Princeton', rank: 4, tuition: 57410, acceptance: 4, satMin: 1460, satMax: 1570 },
  { name: 'Yale University', country: 'United States', city: 'New Haven', rank: 5, tuition: 62700, acceptance: 5, satMin: 1460, satMax: 1570 },
  { name: 'University of Chicago', country: 'United States', city: 'Chicago', rank: 6, tuition: 60552, acceptance: 5, satMin: 1470, satMax: 1570 },
  { name: 'California Institute of Technology', country: 'United States', city: 'Pasadena', rank: 7, tuition: 60864, acceptance: 4, satMin: 1530, satMax: 1580 },
  { name: 'Columbia University', country: 'United States', city: 'New York', rank: 8, tuition: 66580, acceptance: 4, satMin: 1470, satMax: 1570 },
  { name: 'University of Pennsylvania', country: 'United States', city: 'Philadelphia', rank: 9, tuition: 61710, acceptance: 5, satMin: 1460, satMax: 1570 },
  { name: 'Johns Hopkins University', country: 'United States', city: 'Baltimore', rank: 10, tuition: 60480, acceptance: 7, satMin: 1470, satMax: 1560 },
  { name: 'Northwestern University', country: 'United States', city: 'Evanston', rank: 11, tuition: 60876, acceptance: 7, satMin: 1450, satMax: 1540 },
  { name: 'Duke University', country: 'United States', city: 'Durham', rank: 12, tuition: 60593, acceptance: 6, satMin: 1470, satMax: 1570 },
  { name: 'Cornell University', country: 'United States', city: 'Ithaca', rank: 13, tuition: 63082, acceptance: 7, satMin: 1400, satMax: 1540 },
  { name: 'Brown University', country: 'United States', city: 'Providence', rank: 14, tuition: 62680, acceptance: 5, satMin: 1440, satMax: 1560 },
  { name: 'Vanderbilt University', country: 'United States', city: 'Nashville', rank: 15, tuition: 58920, acceptance: 7, satMin: 1450, satMax: 1560 },
  { name: 'Rice University', country: 'United States', city: 'Houston', rank: 16, tuition: 54700, acceptance: 9, satMin: 1450, satMax: 1560 },
  { name: 'Dartmouth College', country: 'United States', city: 'Hanover', rank: 17, tuition: 62120, acceptance: 6, satMin: 1440, satMax: 1560 },
  { name: 'University of Notre Dame', country: 'United States', city: 'Notre Dame', rank: 18, tuition: 58348, acceptance: 12, satMin: 1410, satMax: 1540 },
  { name: 'UCLA', country: 'United States', city: 'Los Angeles', rank: 20, tuition: 43294, acceptance: 9, satMin: 1330, satMax: 1530 },
  { name: 'UC Berkeley', country: 'United States', city: 'Berkeley', rank: 21, tuition: 44468, acceptance: 11, satMin: 1330, satMax: 1530 },
  { name: 'Carnegie Mellon University', country: 'United States', city: 'Pittsburgh', rank: 22, tuition: 58920, acceptance: 11, satMin: 1450, satMax: 1560 },
  { name: 'University of Michigan', country: 'United States', city: 'Ann Arbor', rank: 23, tuition: 57273, acceptance: 18, satMin: 1340, satMax: 1520 },
  { name: 'University of Virginia', country: 'United States', city: 'Charlottesville', rank: 24, tuition: 56210, acceptance: 19, satMin: 1330, satMax: 1500 },
  { name: 'Georgia Institute of Technology', country: 'United States', city: 'Atlanta', rank: 25, tuition: 32398, acceptance: 17, satMin: 1370, satMax: 1530 },
  { name: 'UNC Chapel Hill', country: 'United States', city: 'Chapel Hill', rank: 26, tuition: 36159, acceptance: 20, satMin: 1300, satMax: 1490 },
  { name: 'University of Toronto', country: 'Canada', city: 'Toronto', rank: 21, tuition: 41000, acceptance: 43, satMin: 1330, satMax: 1530 },
  { name: 'University of British Columbia', country: 'Canada', city: 'Vancouver', rank: 34, tuition: 38000, acceptance: 52, satMin: 1300, satMax: 1500 },
  { name: 'McGill University', country: 'Canada', city: 'Montreal', rank: 30, tuition: 35000, acceptance: 46, satMin: 1320, satMax: 1520 },
  { name: 'University of Waterloo', country: 'Canada', city: 'Waterloo', rank: 112, tuition: 36000, acceptance: 53, satMin: 1300, satMax: 1480 },
  { name: 'McMaster University', country: 'Canada', city: 'Hamilton', rank: 78, tuition: 34000, acceptance: 58, satMin: 1280, satMax: 1460 },
  { name: 'University of Oxford', country: 'United Kingdom', city: 'Oxford', rank: 1, tuition: 38000, acceptance: 17, satMin: 1470, satMax: 1580 },
  { name: 'University of Cambridge', country: 'United Kingdom', city: 'Cambridge', rank: 2, tuition: 37000, acceptance: 21, satMin: 1460, satMax: 1580 },
  { name: 'Imperial College London', country: 'United Kingdom', city: 'London', rank: 6, tuition: 35000, acceptance: 14, satMin: 1440, satMax: 1570 },
  { name: 'UCL', country: 'United Kingdom', city: 'London', rank: 8, tuition: 28000, acceptance: 32, satMin: 1350, satMax: 1530 },
  { name: 'University of Edinburgh', country: 'United Kingdom', city: 'Edinburgh', rank: 15, tuition: 26000, acceptance: 40, satMin: 1300, satMax: 1500 },
  { name: 'University of Melbourne', country: 'Australia', city: 'Melbourne', rank: 14, tuition: 31700, acceptance: 70, satMin: 1250, satMax: 1480 },
  { name: 'University of Sydney', country: 'Australia', city: 'Sydney', rank: 19, tuition: 34000, acceptance: 68, satMin: 1250, satMax: 1470 },
  { name: 'ETH Zurich', country: 'Switzerland', city: 'Zurich', rank: 7, tuition: 1600, acceptance: 27, satMin: 1400, satMax: 1560 },
  { name: 'EPFL', country: 'Switzerland', city: 'Lausanne', rank: 16, tuition: 1600, acceptance: 20, satMin: 1400, satMax: 1560 },
  { name: 'National University of Singapore', country: 'Singapore', city: 'Singapore', rank: 8, tuition: 24000, acceptance: 5, satMin: 1400, satMax: 1560 },
  { name: 'Nanyang Technological University', country: 'Singapore', city: 'Singapore', rank: 11, tuition: 23000, acceptance: 6, satMin: 1380, satMax: 1540 },
  { name: 'University of Tokyo', country: 'Japan', city: 'Tokyo', rank: 24, tuition: 5000, acceptance: 34, satMin: 1350, satMax: 1530 },
  { name: 'Kyoto University', country: 'Japan', city: 'Kyoto', rank: 33, tuition: 5000, acceptance: 38, satMin: 1330, satMax: 1520 },
  { name: 'Seoul National University', country: 'South Korea', city: 'Seoul', rank: 29, tuition: 6000, acceptance: 15, satMin: 1370, satMax: 1540 },
  { name: 'KAIST', country: 'South Korea', city: 'Daejeon', rank: 41, tuition: 7000, acceptance: 18, satMin: 1380, satMax: 1550 },
  { name: 'Technical University of Munich', country: 'Germany', city: 'Munich', rank: 37, tuition: 3000, acceptance: 25, satMin: 1350, satMax: 1520 },
  { name: 'Heidelberg University', country: 'Germany', city: 'Heidelberg', rank: 46, tuition: 3000, acceptance: 30, satMin: 1320, satMax: 1500 },
  { name: 'University of Amsterdam', country: 'Netherlands', city: 'Amsterdam', rank: 55, tuition: 18200, acceptance: 45, satMin: 1300, satMax: 1490 },
  { name: 'Delft University of Technology', country: 'Netherlands', city: 'Delft', rank: 47, tuition: 19000, acceptance: 40, satMin: 1320, satMax: 1510 },
  { name: 'Sorbonne University', country: 'France', city: 'Paris', rank: 59, tuition: 12000, acceptance: 35, satMin: 1300, satMax: 1500 },
  { name: 'PSL University', country: 'France', city: 'Paris', rank: 26, tuition: 12000, acceptance: 20, satMin: 1380, satMax: 1550 },
  { name: 'Tsinghua University', country: 'China', city: 'Beijing', rank: 12, tuition: 8000, acceptance: 10, satMin: 1400, satMax: 1560 },
  { name: 'Peking University', country: 'China', city: 'Beijing', rank: 14, tuition: 7500, acceptance: 12, satMin: 1380, satMax: 1550 },
  { name: 'University of Hong Kong', country: 'Hong Kong', city: 'Hong Kong', rank: 22, tuition: 22000, acceptance: 30, satMin: 1350, satMax: 1530 },
  { name: 'Hong Kong University of Science and Technology', country: 'Hong Kong', city: 'Hong Kong', rank: 36, tuition: 21000, acceptance: 25, satMin: 1360, satMax: 1540 },
  { name: 'University of Copenhagen', country: 'Denmark', city: 'Copenhagen', rank: 32, tuition: 12000, acceptance: 40, satMin: 1300, satMax: 1500 },
  { name: 'Karolinska Institute', country: 'Sweden', city: 'Stockholm', rank: 43, tuition: 15000, acceptance: 25, satMin: 1350, satMax: 1520 },
  { name: 'Lund University', country: 'Sweden', city: 'Lund', rank: 75, tuition: 14000, acceptance: 35, satMin: 1280, satMax: 1480 },
  { name: 'Trinity College Dublin', country: 'Ireland', city: 'Dublin', rank: 81, tuition: 22000, acceptance: 33, satMin: 1300, satMax: 1500 },
  { name: 'University of Auckland', country: 'New Zealand', city: 'Auckland', rank: 65, tuition: 28000, acceptance: 55, satMin: 1250, satMax: 1460 },
  { name: 'New York University', country: 'United States', city: 'New York', rank: 27, tuition: 58460, acceptance: 12, satMin: 1380, satMax: 1550 },
  { name: 'University of Southern California', country: 'United States', city: 'Los Angeles', rank: 28, tuition: 64990, acceptance: 12, satMin: 1370, satMax: 1540 },
  { name: 'University of Texas at Austin', country: 'United States', city: 'Austin', rank: 32, tuition: 40990, acceptance: 29, satMin: 1230, satMax: 1480 },
  { name: 'University of Washington', country: 'United States', city: 'Seattle', rank: 35, tuition: 39114, acceptance: 48, satMin: 1300, satMax: 1500 },
  { name: 'University of Illinois Urbana-Champaign', country: 'United States', city: 'Urbana', rank: 41, tuition: 34940, acceptance: 45, satMin: 1300, satMax: 1510 },
  { name: 'Boston University', country: 'United States', city: 'Boston', rank: 43, tuition: 59840, acceptance: 14, satMin: 1360, satMax: 1540 },
  { name: 'Tufts University', country: 'United States', city: 'Medford', rank: 51, tuition: 61704, acceptance: 15, satMin: 1380, satMax: 1540 },
  { name: 'University of Wisconsin-Madison', country: 'United States', city: 'Madison', rank: 52, tuition: 39114, acceptance: 49, satMin: 1290, satMax: 1480 },
  { name: 'University of California Davis', country: 'United States', city: 'Davis', rank: 54, tuition: 44468, acceptance: 46, satMin: 1280, satMax: 1490 },
  { name: 'University of California San Diego', country: 'United States', city: 'San Diego', rank: 56, tuition: 46622, acceptance: 24, satMin: 1330, satMax: 1530 },
  { name: 'Purdue University', country: 'United States', city: 'West Lafayette', rank: 57, tuition: 28794, acceptance: 52, satMin: 1200, satMax: 1450 },
  { name: 'Lehigh University', country: 'United States', city: 'Bethlehem', rank: 60, tuition: 57350, acceptance: 22, satMin: 1330, satMax: 1500 },
  { name: 'University of Florida', country: 'United States', city: 'Gainesville', rank: 64, tuition: 21647, acceptance: 30, satMin: 1300, satMax: 1480 },
  { name: 'Ohio State University', country: 'United States', city: 'Columbus', rank: 67, tuition: 35665, acceptance: 53, satMin: 1250, satMax: 1450 },
  { name: 'Pennsylvania State University', country: 'United States', city: 'University Park', rank: 68, tuition: 36476, acceptance: 55, satMin: 1240, satMax: 1450 },
  { name: 'Rutgers University', country: 'United States', city: 'New Brunswick', rank: 70, tuition: 33693, acceptance: 61, satMin: 1230, satMax: 1440 },
  { name: 'University of Maryland', country: 'United States', city: 'College Park', rank: 71, tuition: 38636, acceptance: 44, satMin: 1280, satMax: 1480 },
  { name: 'University of Pittsburgh', country: 'United States', city: 'Pittsburgh', rank: 73, tuition: 34598, acceptance: 49, satMin: 1250, satMax: 1450 },
  { name: 'Michigan State University', country: 'United States', city: 'East Lansing', rank: 77, tuition: 39766, acceptance: 76, satMin: 1180, satMax: 1410 },
  { name: 'Indiana University Bloomington', country: 'United States', city: 'Bloomington', rank: 79, tuition: 37600, acceptance: 73, satMin: 1190, satMax: 1420 },
  { name: 'University of Minnesota Twin Cities', country: 'United States', city: 'Minneapolis', rank: 84, tuition: 33152, acceptance: 70, satMin: 1230, satMax: 1440 },
  { name: 'University of Connecticut', country: 'United States', city: 'Storrs', rank: 85, tuition: 39668, acceptance: 55, satMin: 1240, satMax: 1450 },
  { name: 'University of Massachusetts Amherst', country: 'United States', city: 'Amherst', rank: 87, tuition: 36108, acceptance: 58, satMin: 1240, satMax: 1450 },
  { name: 'Wake Forest University', country: 'United States', city: 'Winston-Salem', rank: 88, tuition: 59762, acceptance: 25, satMin: 1350, satMax: 1520 },
  { name: 'Tulane University', country: 'United States', city: 'New Orleans', rank: 89, tuition: 60814, acceptance: 11, satMin: 1360, satMax: 1530 },
  { name: 'University of Rochester', country: 'United States', city: 'Rochester', rank: 90, tuition: 59280, acceptance: 35, satMin: 1340, satMax: 1520 },
  { name: 'Baylor University', country: 'United States', city: 'Waco', rank: 91, tuition: 54390, acceptance: 45, satMin: 1280, satMax: 1470 },
  { name: 'University of Virginia', country: 'United States', city: 'Charlottesville', rank: 24, tuition: 56210, acceptance: 19, satMin: 1330, satMax: 1500 },
  { name: 'William & Mary', country: 'United States', city: 'Williamsburg', rank: 53, tuition: 46890, acceptance: 33, satMin: 1330, satMax: 1500 },
  { name: 'George Washington University', country: 'United States', city: 'Washington', rank: 67, tuition: 61910, acceptance: 43, satMin: 1300, satMax: 1480 },
  { name: 'Southern Methodist University', country: 'United States', city: 'Dallas', rank: 72, tuition: 58130, acceptance: 48, satMin: 1300, satMax: 1480 },
  { name: 'Syracuse University', country: 'United States', city: 'Syracuse', rank: 75, tuition: 57846, acceptance: 50, satMin: 1280, satMax: 1470 },
  { name: 'University of Delaware', country: 'United States', city: 'Newark', rank: 82, tuition: 36220, acceptance: 62, satMin: 1230, satMax: 1440 },
  { name: 'American University', country: 'United States', city: 'Washington', rank: 83, tuition: 53416, acceptance: 39, satMin: 1280, satMax: 1470 },
  { name: 'Miami University', country: 'United States', city: 'Oxford', rank: 86, tuition: 38488, acceptance: 64, satMin: 1220, satMax: 1430 },
  { name: 'University of Iowa', country: 'United States', city: 'Iowa City', rank: 93, tuition: 32768, acceptance: 81, satMin: 1170, satMax: 1400 },
  { name: 'University of Kansas', country: 'United States', city: 'Lawrence', rank: 94, tuition: 28890, acceptance: 88, satMin: 1140, satMax: 1380 },
  { name: 'University of Oregon', country: 'United States', city: 'Eugene', rank: 98, tuition: 39030, acceptance: 83, satMin: 1160, satMax: 1390 },
  { name: 'University of Arizona', country: 'United States', city: 'Tucson', rank: 99, tuition: 35700, acceptance: 85, satMin: 1150, satMax: 1380 },
  { name: 'Arizona State University', country: 'United States', city: 'Tempe', rank: 100, tuition: 31200, acceptance: 88, satMin: 1130, satMax: 1370 },
  { name: 'University of Colorado Boulder', country: 'United States', city: 'Boulder', rank: 101, tuition: 41200, acceptance: 79, satMin: 1180, satMax: 1410 },
  { name: 'University of Denver', country: 'United States', city: 'Denver', rank: 102, tuition: 54660, acceptance: 59, satMin: 1240, satMax: 1450 },
  { name: 'University of San Francisco', country: 'United States', city: 'San Francisco', rank: 103, tuition: 54740, acceptance: 65, satMin: 1220, satMax: 1430 },
  { name: 'Loyola Marymount University', country: 'United States', city: 'Los Angeles', rank: 104, tuition: 56020, acceptance: 44, satMin: 1260, satMax: 1460 },
  { name: 'DePaul University', country: 'United States', city: 'Chicago', rank: 105, tuition: 44010, acceptance: 68, satMin: 1180, satMax: 1410 },
  { name: 'University of San Diego', country: 'United States', city: 'San Diego', rank: 106, tuition: 54130, acceptance: 49, satMin: 1270, satMax: 1460 },
  { name: 'University of Tulsa', country: 'United States', city: 'Tulsa', rank: 107, tuition: 47010, acceptance: 69, satMin: 1190, satMax: 1420 },
  { name: 'University of Dayton', country: 'United States', city: 'Dayton', rank: 108, tuition: 44600, acceptance: 74, satMin: 1170, satMax: 1400 },
  { name: 'University of St. Thomas', country: 'United States', city: 'St. Paul', rank: 110, tuition: 46600, acceptance: 71, satMin: 1180, satMax: 1410 },
  { name: 'University of Rhode Island', country: 'United States', city: 'Kingston', rank: 111, tuition: 32360, acceptance: 76, satMin: 1170, satMax: 1400 },
  { name: 'University of Maine', country: 'United States', city: 'Orono', rank: 112, tuition: 29840, acceptance: 92, satMin: 1120, satMax: 1360 },
  { name: 'University of Wyoming', country: 'United States', city: 'Laramie', rank: 113, tuition: 24600, acceptance: 96, satMin: 1100, satMax: 1340 },
  { name: 'University of Montana', country: 'United States', city: 'Missoula', rank: 114, tuition: 27340, acceptance: 93, satMin: 1110, satMax: 1350 },
  { name: 'University of Nevada Reno', country: 'United States', city: 'Reno', rank: 115, tuition: 25700, acceptance: 88, satMin: 1140, satMax: 1380 },
  { name: 'University of New Mexico', country: 'United States', city: 'Albuquerque', rank: 116, tuition: 26800, acceptance: 95, satMin: 1110, satMax: 1350 },
  { name: 'University of Hawaii at Manoa', country: 'United States', city: 'Honolulu', rank: 117, tuition: 34200, acceptance: 84, satMin: 1160, satMax: 1390 },
  { name: 'University of Alaska Fairbanks', country: 'United States', city: 'Fairbanks', rank: 118, tuition: 21900, acceptance: 98, satMin: 1080, satMax: 1330 },
  { name: 'University of Vermont', country: 'United States', city: 'Burlington', rank: 119, tuition: 42500, acceptance: 67, satMin: 1210, satMax: 1430 },
];

// Generate universities to reach 500+
function generateUniversities(): University[] {
  const result: University[] = [];
  let id = 1;

  // Add real universities
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
    });
  }

  // Generate additional universities to reach 500+
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

    // Avoid duplicates
    if (result.some(u => u.name === name)) continue;

    const rank = 50 + Math.floor(Math.random() * 450);
    const tuition = Math.floor((5000 + Math.random() * 60000) / 1000) * 1000;
    const acceptance = Math.floor(5 + Math.random() * 85);
    const satMin = 1100 + Math.floor(Math.random() * 350);
    const satMax = satMin + 80 + Math.floor(Math.random() * 120);
    const majorsCount = 3 + Math.floor(Math.random() * 4);
    const majors = [...majorOptions].sort(() => Math.random() - 0.5).slice(0, majorsCount);

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
    });
  }

  return result;
}

export const universities = generateUniversities();

export const allCountries = [...new Set(universities.map(u => u.country))].sort();
export const allMajors = majorOptions;
