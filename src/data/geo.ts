// Indian geography + naming data used by seed generators and address forms.

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export interface CityInfo {
  city: string;
  state: string;
  pin: number; // base pincode
  areas: string[];
}

export const CITIES: CityInfo[] = [
  { city: "Mumbai", state: "Maharashtra", pin: 400050, areas: ["Bandra West", "Andheri East", "Powai", "Dadar West", "Juhu", "Lower Parel"] },
  { city: "New Delhi", state: "Delhi", pin: 110017, areas: ["Saket", "Hauz Khas", "Lajpat Nagar", "Greater Kailash II", "Vasant Kunj"] },
  { city: "Bengaluru", state: "Karnataka", pin: 560034, areas: ["Koramangala 5th Block", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar 4th Block"] },
  { city: "Hyderabad", state: "Telangana", pin: 500034, areas: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur"] },
  { city: "Chennai", state: "Tamil Nadu", pin: 600020, areas: ["Adyar", "T Nagar", "Anna Nagar", "Besant Nagar", "Nungambakkam"] },
  { city: "Pune", state: "Maharashtra", pin: 411001, areas: ["Koregaon Park", "Baner", "Kothrud", "Viman Nagar", "Aundh"] },
  { city: "Kolkata", state: "West Bengal", pin: 700019, areas: ["Ballygunge", "Salt Lake Sector V", "New Alipore", "Park Street", "Behala"] },
  { city: "Ahmedabad", state: "Gujarat", pin: 380015, areas: ["Satellite", "Navrangpura", "Prahlad Nagar", "Bodakdev", "Vastrapur"] },
  { city: "Jaipur", state: "Rajasthan", pin: 302001, areas: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Bani Park"] },
  { city: "Gurugram", state: "Haryana", pin: 122002, areas: ["DLF Phase 2", "Sector 56", "Sohna Road", "Golf Course Road", "Sushant Lok 1"] },
  { city: "Lucknow", state: "Uttar Pradesh", pin: 226010, areas: ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar"] },
  { city: "Kochi", state: "Kerala", pin: 682016, areas: ["Panampilly Nagar", "Kakkanad", "Edappally", "Marine Drive"] },
  { city: "Chandigarh", state: "Chandigarh", pin: 160022, areas: ["Sector 22", "Sector 35", "Sector 8", "Sector 17"] },
  { city: "Indore", state: "Madhya Pradesh", pin: 452001, areas: ["Vijay Nagar", "Palasia", "Saket Nagar"] },
  { city: "Bhubaneswar", state: "Odisha", pin: 751013, areas: ["Saheed Nagar", "Patia", "Jaydev Vihar"] },
  { city: "Nagpur", state: "Maharashtra", pin: 440010, areas: ["Dharampeth", "Ramdaspeth", "Civil Lines"] },
];

export const FEMALE_NAMES = [
  "Ananya", "Aditi", "Ishita", "Kavya", "Meera", "Neha", "Priya", "Riya", "Saanvi", "Shreya", "Tanvi", "Diya",
  "Nisha", "Pooja", "Radhika", "Sneha", "Tara", "Aarohi", "Simran", "Kritika", "Mehak", "Avni", "Jhanvi", "Lakshmi",
  "Devika", "Anjali", "Nandini", "Sana", "Zoya", "Farah",
];
export const MALE_NAMES = [
  "Aarav", "Arjun", "Rohan", "Vihaan", "Kabir", "Ishaan", "Rahul", "Aditya", "Karan", "Nikhil", "Siddharth", "Varun",
  "Yash", "Dev", "Manav", "Harsh", "Pranav", "Tejas", "Rishi", "Vivek", "Imran", "Faisal", "Gaurav", "Akash",
  "Mohit", "Sameer", "Kunal", "Neeraj", "Jatin", "Abhishek",
];
export const LAST_NAMES = [
  "Sharma", "Verma", "Iyer", "Nair", "Menon", "Reddy", "Patel", "Shah", "Mehta", "Kapoor", "Khanna", "Malhotra",
  "Bose", "Chatterjee", "Das", "Banerjee", "Joshi", "Kulkarni", "Deshmukh", "Pillai", "Rao", "Naidu", "Singh",
  "Gill", "Chopra", "Bhatia", "Agarwal", "Gupta", "Jain", "Khan", "Ahmed", "Qureshi", "Fernandes", "D'Souza",
  "Thakur", "Saxena", "Mishra", "Tiwari", "Ghosh", "Sinha",
];
export const BUILDINGS = [
  "Shanti Residency", "Lakeview Apartments", "Green Meadows", "Sunrise Heights", "Orchid Towers", "Palm Court",
  "Skyline Enclave", "Brigade Gateway", "Ivory Gardens", "Kaveri Apartments", "Prestige Greens", "Heritage Villas",
];
export const EMAIL_DOMAINS = ["gmail.com", "gmail.com", "gmail.com", "outlook.com", "yahoo.in", "icloud.com", "hotmail.com"];
