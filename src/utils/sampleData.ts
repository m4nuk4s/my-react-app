// Sample data for drivers and guides
import { existingDrivers } from './existingDrivers';
import { supabase } from '@/lib/supabase';

export interface Driver {
  id: string;
  name: string;
  version: string;
  os: string;
  description: string;
  downloadUrl: string;
  size: string;
  dateAdded: string;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  steps: Array<{ step: number; instruction: string; imageUrl?: string }>;
  dateAdded: string;
}

export const sampleDrivers: Driver[] = [
  {
    id: "driver-001",
    name: "Intel WiFi 6 AX200",
    version: "22.70.0",
    os: "Windows 10, 11",
    description: "Latest drivers for Intel WiFi 6 AX200 wireless adapters",
    downloadUrl: "#",
    size: "25.4 MB",
    dateAdded: "2025-07-01"
  },
  {
    id: "driver-002",
    name: "NVIDIA GeForce RTX 3080",
    version: "531.41",
    os: "Windows 10, 11",
    description: "Game Ready Driver for the latest game releases",
    downloadUrl: "#",
    size: "756.2 MB",
    dateAdded: "2025-07-05"
  },
  {
    id: "driver-003",
    name: "Realtek HD Audio",
    version: "6.0.9414.1",
    os: "Windows 10, 11",
    description: "Audio driver for Realtek High Definition Audio chipsets",
    downloadUrl: "#",
    size: "43.8 MB",
    dateAdded: "2025-06-28"
  }
];

export const sampleGuides: Guide[] = [
  {
    id: "guide-001",
    title: "Laptop RAM Upgrade",
    description: "How to upgrade RAM in most modern laptops",
    category: "Hardware",
    difficulty: "Beginner",
    steps: [
      { step: 1, instruction: "Power off your laptop and unplug all cables" },
      { step: 2, instruction: "Flip laptop over and remove the bottom cover screws" },
      { step: 3, instruction: "Gently remove the bottom panel" },
      { step: 4, instruction: "Locate RAM slots and release side clips" },
      { step: 5, instruction: "Insert new RAM at 45-degree angle and press down until clips snap" },
      { step: 6, instruction: "Replace the bottom panel and screws" }
    ],
    dateAdded: "2025-06-20"
  },
  {
    id: "guide-002",
    title: "SSD Installation",
    description: "Installing an SSD to replace or add to existing storage",
    category: "Hardware",
    difficulty: "Intermediate",
    steps: [
      { step: 1, instruction: "Power off computer and unplug all cables" },
      { step: 2, instruction: "Open computer case by removing side panel screws" },
      { step: 3, instruction: "Locate available 2.5\" bay or M.2 slot" },
      { step: 4, instruction: "For 2.5\" SSD: Connect SATA and power cables" },
      { step: 5, instruction: "For M.2 SSD: Insert at angle and secure with screw" },
      { step: 6, instruction: "Close computer case and restart" }
    ],
    dateAdded: "2025-06-25"
  },
  {
    id: "guide-003",
    title: "Windows 10 Clean Installation",
    description: "Complete guide for clean installation of Windows 10",
    category: "Software",
    difficulty: "Intermediate",
    steps: [
      { step: 1, instruction: "Create Windows 10 installation media with Media Creation Tool" },
      { step: 2, instruction: "Back up all important data" },
      { step: 3, instruction: "Boot from installation media" },
      { step: 4, instruction: "Follow installation prompts, select Custom Install" },
      { step: 5, instruction: "Delete existing partitions if performing clean install" },
      { step: 6, instruction: "Create new partition and format" },
      { step: 7, instruction: "Complete installation and initial setup" }
    ],
    dateAdded: "2025-07-10"
  }
];

// Function to initialize sample data - using Supabase if available, or localStorage as fallback
export const initializeSampleData = async () => {
  // Try to use Supabase first
  let useSupabase = false;
  
  try {
    const { data: healthCheck, error } = await supabase.from('users').select('id').limit(1);
    useSupabase = !error; // If no error, we can use Supabase
    console.log('Supabase connection check:', useSupabase ? 'successful' : 'failed');
  } catch (e) {
    console.error('Error checking Supabase connection:', e);
    useSupabase = false;
  }
  
  // DRIVERS - Convert to format expected by the admin panel
  const adminDrivers = sampleDrivers.map((driver) => ({
    id: driver.id,
    name: driver.name,
    category: "laptops",
    manufacturer: driver.name.split(' ')[0],
    image: "/assets/images/driver-placeholder.jpg",
    os: driver.os.toLowerCase().includes("10") ? ["windows10"] : 
        driver.os.toLowerCase().includes("11") ? ["windows11"] : ["windows10", "windows11"],
    drivers: [{
      name: driver.name,
      version: driver.version,
      date: driver.dateAdded,
      size: driver.size,
      link: driver.downloadUrl
    }]
  }));
  
  // Convert existing drivers to admin format (string IDs for admin compatibility)
  const convertedExistingDrivers = existingDrivers.map(driver => ({
    ...driver,
    id: driver.id.toString(), // Convert numeric ID to string for admin
    image: typeof driver.image === 'string' ? driver.image : '/assets/images/driver-placeholder.jpg'
  }));
  
  // Combine with any additional admin drivers
  const allDrivers = [
    ...convertedExistingDrivers,
    ...adminDrivers
  ];
  
  // GUIDES - Convert to format expected by the admin panel
  const adminGuides = sampleGuides.map((guide) => ({
    id: guide.id,
    title: guide.title,
    model: "Generic",
    category: guide.category,
    difficulty: guide.difficulty.toLowerCase(),
    time: "30 minutes",
    description: guide.description,
    steps: guide.steps.map((step) => ({
      title: `Step ${step.step}`,
      description: step.instruction,
      imageUrl: step.imageUrl
    })),
    createdBy: "system"
  }));
  
  if (useSupabase) {
    // If we can use Supabase, store data there
    try {
      // Store drivers data in Supabase
      await Promise.all(allDrivers.map(async (driver) => {
        // Check if driver already exists
        const { data: existingDriver } = await supabase
          .from('drivers')
          .select('id')
          .eq('name', driver.name)
          .single();
          
        if (!existingDriver) {
          // Insert if it doesn't exist
          await supabase
            .from('drivers')
            .insert({
              name: driver.name,
              version: driver.drivers[0].version,
              description: driver.drivers[0].name,
              os_version: driver.os.join(', '),
              device_model: driver.category,
              download_url: driver.drivers[0].link,
              author_id: null
            });
        }
      }));
      
      // Store guides data in Supabase
      await Promise.all(adminGuides.map(async (guide) => {
        // Check if guide already exists
        const { data: existingGuide } = await supabase
          .from('guides')
          .select('id')
          .eq('title', guide.title)
          .single();
          
        if (!existingGuide) {
          // Insert if it doesn't exist
          await supabase
            .from('guides')
            .insert({
              title: guide.title,
              content: JSON.stringify(guide.steps),
              category: guide.category,
              thumbnail: null,
              author_id: null
            });
        }
      }));
      
      // Store disassembly guides in Supabase
      await Promise.all(adminGuides.map(async (guide) => {
        // Check if disassembly guide already exists
        const { data: existingGuide } = await supabase
          .from('disassembly_guides')
          .select('id')
          .eq('title', guide.title)
          .single();
          
        if (!existingGuide) {
          // Insert if it doesn't exist
          await supabase
            .from('disassembly_guides')
            .insert({
              title: guide.title,
              content: JSON.stringify(guide.steps),
              device_model: guide.model,
              difficulty: guide.difficulty,
              estimated_time: guide.time,
              thumbnail: null,
              author_id: null
            });
        }
      }));
      
      console.log('Sample data initialized in Supabase');
    } catch (error) {
      console.error('Error initializing Supabase data:', error);
      // Fall back to localStorage if Supabase operations fail
      initializeLocalStorage();
    }
  } else {
    // Use localStorage as fallback
    initializeLocalStorage();
  }
};

// Separate function to initialize localStorage data
function initializeLocalStorage() {
  // Only set drivers data if it doesn't already exist
  if (!localStorage.getItem('drivers')) {
    const adminDrivers = sampleDrivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      category: "laptops",
      manufacturer: driver.name.split(' ')[0],
      image: "/assets/images/driver-placeholder.jpg",
      os: driver.os.toLowerCase().includes("10") ? ["windows10"] : 
          driver.os.toLowerCase().includes("11") ? ["windows11"] : ["windows10", "windows11"],
      drivers: [{
        name: driver.name,
        version: driver.version,
        date: driver.dateAdded,
        size: driver.size,
        link: driver.downloadUrl
      }]
    }));
    
    // Convert existing drivers to admin format
    const convertedExistingDrivers = existingDrivers.map(driver => ({
      ...driver,
      id: driver.id.toString(),
      image: typeof driver.image === 'string' ? driver.image : '/assets/images/driver-placeholder.jpg'
    }));
    
    // Combine with any additional admin drivers
    const allDrivers = [
      ...convertedExistingDrivers,
      ...adminDrivers
    ];
    
    localStorage.setItem('drivers', JSON.stringify(allDrivers));
  }
  
  // For disassemblyGuides (used in admin panel)
  if (!localStorage.getItem('disassemblyGuides')) {
    const adminGuides = sampleGuides.map((guide) => ({
      id: guide.id,
      title: guide.title,
      model: "Generic",
      category: guide.category,
      difficulty: guide.difficulty.toLowerCase(),
      time: "30 minutes",
      description: guide.description,
      steps: guide.steps.map((step) => ({
        title: `Step ${step.step}`,
        description: step.instruction,
        imageUrl: step.imageUrl
      })),
      createdBy: "system"
    }));
    
    localStorage.setItem('disassemblyGuides', JSON.stringify(adminGuides));
  }
  
  // For guides (used in guides page)
  if (!localStorage.getItem('guides')) {
    localStorage.setItem('guides', JSON.stringify(sampleGuides));
  }
  
  console.log("Sample data initialized in localStorage:");
  console.log("Drivers format:", localStorage.getItem('drivers') ? "ok" : "missing");
  console.log("Guides format:", localStorage.getItem('guides') ? "ok" : "missing");
  console.log("DisassemblyGuides format:", localStorage.getItem('disassemblyGuides') ? "ok" : "missing");
}