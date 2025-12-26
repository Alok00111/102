-- =====================================================
-- SEED DATA: Bangalore Universities & Colleges
-- Comprehensive list of major institutions
-- Run this AFTER schema.sql
-- =====================================================

INSERT INTO universities (name, short_code, city, state, established_year, accreditation, website) VALUES

-- Premier Research & Management Institutions
('Indian Institute of Science', 'IISC', 'Bangalore', 'Karnataka', 1909, 'NAAC A++', 'https://www.iisc.ac.in'),
('Indian Institute of Management Bangalore', 'IIMB', 'Bangalore', 'Karnataka', 1973, 'AACSB, EQUIS, AMBA', 'https://www.iimb.ac.in'),
('Indian Statistical Institute Bangalore', 'ISIB', 'Bangalore', 'Karnataka', 1931, 'Deemed University', 'https://www.isibang.ac.in'),

-- Major State Universities
('Bangalore University', 'BU', 'Bangalore', 'Karnataka', 1886, 'NAAC A+', 'http://bangaloreuniversity.ac.in'),
('Visvesvaraya Technological University', 'VTU', 'Belagavi', 'Karnataka', 1998, 'NBA', 'https://www.vtu.ac.in'),

-- Private Universities
('Christ University', 'CHRIST', 'Bangalore', 'Karnataka', 1969, 'NAAC A++', 'https://christuniversity.in'),
('Jain University', 'JAIN', 'Bangalore', 'Karnataka', 1990, 'NAAC A++', 'https://www.jainuniversity.ac.in'),
('PES University', 'PESU', 'Bangalore', 'Karnataka', 1972, 'NAAC A+', 'https://www.pes.edu'),
('M. S. Ramaiah University of Applied Sciences', 'MSRUAS', 'Bangalore', 'Karnataka', 2013, 'NAAC A', 'https://www.msruas.ac.in'),
('Reva University', 'REVA', 'Bangalore', 'Karnataka', 2012, 'NAAC A+', 'https://www.rfreva.edu.in'),
('CMR University', 'CMRU', 'Bangalore', 'Karnataka', 2013, 'NAAC A', 'https://www.cmr.edu.in'),
('Presidency University', 'PUB', 'Bangalore', 'Karnataka', 2013, 'NAAC A', 'https://www.presidencyuniversity.in'),
('Alliance University', 'AU', 'Bangalore', 'Karnataka', 2010, 'AACSB', 'https://www.alliance.edu.in'),
('Azim Premji University', 'APU', 'Bangalore', 'Karnataka', 2010, 'NAAC A', 'https://azimpremjiuniversity.edu.in'),
('Dayananda Sagar University', 'DSU', 'Bangalore', 'Karnataka', 2014, 'NAAC A', 'https://www.dsu.edu.in'),
('Garden City University', 'GCU', 'Bangalore', 'Karnataka', 2013, 'NAAC A', 'https://www.gardencity.university'),
('RV University', 'RVU', 'Bangalore', 'Karnataka', 2021, 'New', 'https://rvu.edu.in'),

-- Top Engineering Colleges (VTU Affiliated)
('RV College of Engineering', 'RVCE', 'Bangalore', 'Karnataka', 1963, 'NAAC A++ NBA', 'https://www.rvce.edu.in'),
('BMS College of Engineering', 'BMSCE', 'Bangalore', 'Karnataka', 1946, 'NAAC A++ NBA', 'https://www.bmsce.ac.in'),
('MS Ramaiah Institute of Technology', 'MSRIT', 'Bangalore', 'Karnataka', 1962, 'NAAC A+ NBA', 'https://www.msrit.edu'),
('Bangalore Institute of Technology', 'BIT', 'Bangalore', 'Karnataka', 1979, 'NAAC A NBA', 'https://www.bit-bangalore.edu.in'),
('Sir M. Visvesvaraya Institute of Technology', 'SMVIT', 'Bangalore', 'Karnataka', 1986, 'NAAC A NBA', 'http://www.sirmvit.edu'),
('Nitte Meenakshi Institute of Technology', 'NMIT', 'Bangalore', 'Karnataka', 2001, 'NAAC A NBA', 'https://nmit.ac.in'),
('New Horizon College of Engineering', 'NHCE', 'Bangalore', 'Karnataka', 2001, 'NAAC A NBA', 'https://newhorizonindia.edu'),
('CMR Institute of Technology', 'CMRIT', 'Bangalore', 'Karnataka', 2000, 'NAAC A', 'https://www.cmrit.ac.in'),
('BMS Institute of Technology and Management', 'BMSIT', 'Bangalore', 'Karnataka', 2002, 'NAAC A NBA', 'https://www.bmsit.ac.in'),
('Dayananda Sagar College of Engineering', 'DSCE', 'Bangalore', 'Karnataka', 1979, 'NAAC A NBA', 'https://www.dsce.edu.in'),
('JSS Academy of Technical Education', 'JSSATE', 'Bangalore', 'Karnataka', 1997, 'NAAC A NBA', 'https://jssateb.ac.in'),
('The National Institute of Engineering', 'NIE', 'Mysore', 'Karnataka', 1946, 'NAAC A++ NBA', 'https://nie.ac.in'),
('SDM College of Engineering and Technology', 'SDMCET', 'Dharwad', 'Karnataka', 1979, 'NAAC A+ NBA', 'https://www.sdmcet.ac.in'),
('KLE Technological University', 'KLETU', 'Hubballi', 'Karnataka', 1947, 'NAAC A+', 'https://www.kletech.ac.in'),

-- IITs/NITs in Karnataka Region
('National Institute of Technology Karnataka', 'NITK', 'Surathkal', 'Karnataka', 1960, 'NAAC A++ NBA', 'https://www.nitk.ac.in'),

-- Deemed Universities
('Manipal Academy of Higher Education', 'MAHE', 'Manipal', 'Karnataka', 1953, 'NAAC A++', 'https://manipal.edu'),
('Symbiosis Institute of Technology', 'SIT', 'Pune', 'Maharashtra', 2008, 'NAAC A+', 'https://www.siu.edu.in'),

-- Management & Business Schools
('Xavier Institute of Management & Entrepreneurship', 'XIME', 'Bangalore', 'Karnataka', 1991, 'AICTE', 'https://www.xime.org'),
('IFIM Business School', 'IFIM', 'Bangalore', 'Karnataka', 1995, 'AACSB', 'https://www.ifimbschool.com'),
('Kristu Jayanti College', 'KJC', 'Bangalore', 'Karnataka', 1999, 'NAAC A++', 'https://kristujayanti.edu.in'),
('Mount Carmel College', 'MCC', 'Bangalore', 'Karnataka', 1948, 'NAAC A++', 'https://www.mountcarmelcollegeblr.co.in'),
('St. Joseph''s University', 'SJU', 'Bangalore', 'Karnataka', 1882, 'NAAC A++', 'https://www.sju.edu.in'),
('Acharya Institute of Technology', 'AIT', 'Bangalore', 'Karnataka', 2000, 'NAAC A NBA', 'https://acharya.ac.in'),
('East Point College of Engineering and Technology', 'EPCET', 'Bangalore', 'Karnataka', 1999, 'NAAC A', 'https://www.eastpoint.ac.in'),
('Cambridge Institute of Technology', 'CIT', 'Bangalore', 'Karnataka', 1990, 'NAAC A', 'https://www.cambridge.edu.in'),

-- Additional Bangalore Colleges
('Sapthagiri College of Engineering', 'SCE', 'Bangalore', 'Karnataka', 2001, 'NAAC B+', 'https://sapthagiri.edu.in'),
('Global Academy of Technology', 'GAT', 'Bangalore', 'Karnataka', 2001, 'NAAC A', 'https://www.gat.ac.in'),
('RNSIT - RNS Institute of Technology', 'RNSIT', 'Bangalore', 'Karnataka', 2001, 'NAAC A NBA', 'https://www.rnsit.ac.in'),
('Sri Krishna Institute of Technology', 'SKIT', 'Bangalore', 'Karnataka', 2004, 'NAAC A', 'https://www.skit.edu.in'),
('Jyothy Institute of Technology', 'JIT', 'Bangalore', 'Karnataka', 2009, 'NAAC A', 'https://www.jyothyit.ac.in'),
('Atria Institute of Technology', 'ATRIA', 'Bangalore', 'Karnataka', 2000, 'NAAC A', 'https://atria.edu'),
('Don Bosco Institute of Technology', 'DBIT', 'Bangalore', 'Karnataka', 2001, 'NAAC A', 'https://www.dbit.co.in'),
('Nagarjuna College of Engineering and Technology', 'NCET', 'Bangalore', 'Karnataka', 2001, 'NAAC B+', 'https://www.ncetbangalore.com'),
('MVJ College of Engineering', 'MVJCE', 'Bangalore', 'Karnataka', 1982, 'NAAC A NBA', 'https://www.mvjce.edu.in'),
('Vemana Institute of Technology', 'VIT', 'Bangalore', 'Karnataka', 1999, 'NAAC A', 'https://www.vemanait.edu.in'),
('Dr. Ambedkar Institute of Technology', 'DRAIT', 'Bangalore', 'Karnataka', 1979, 'NAAC A NBA', 'https://www.drait.edu.in'),
('Siddaganga Institute of Technology', 'SITECH', 'Tumkur', 'Karnataka', 1963, 'NAAC A++ NBA', 'https://sit.ac.in');

-- =====================================================
-- Verify Insertion
-- =====================================================
DO $$
DECLARE
    uni_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO uni_count FROM universities;
    RAISE NOTICE 'Successfully inserted % universities!', uni_count;
END $$;
