import { supabase } from '@/lib/supabase';

// Type definitions
interface Driver {
  id: string;
  name: string;
  version: string;
  os_version: string;
  description: string;
  download_url: string;
  device_model: string;
  author_id: string | null;
  [key: string]: string | number | boolean | null; // For additional properties
}

interface Guide {
  id: string;
  title: string;
  content: string;
  category: string;
  thumbnail: string | null;
  author_id: string | null;
  description?: string;
  difficulty?: string;
  [key: string]: string | number | boolean | null | undefined; // For additional properties
}

interface DisassemblyGuide {
  id: string;
  title: string;
  content: string;
  device_model: string;
  difficulty: string;
  estimated_time: string;
  thumbnail: string | null;
  author_id: string | null;
  [key: string]: string | number | boolean | null | undefined; // For additional properties
}

// User Management
export const getUserById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const approveUser = async (userId: string) => {
  try {
    // First try using the edge function
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth/approve-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    // Fallback to direct database update if edge function fails
    const { data, error } = await supabase
      .from('users')
      .update({ isApproved: true })
      .eq('id', userId)
      .select();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    // First try using the edge function
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth/get-all-users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    // Fallback to direct database query
    const { data, error } = await supabase
      .from('users')
      .select('*');
      
    if (error) throw error;
    
    // Remove sensitive data
    const safeUsers = data.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    return { users: safeUsers };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Drivers Management
export const getAllDrivers = async () => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all drivers:', error);
    // Fallback to localStorage
    const driversData = localStorage.getItem('drivers');
    return driversData ? JSON.parse(driversData) : [];
  }
};

export const getDriverById = async (driverId: string) => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', driverId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting driver:', error);
    
    // Fallback to localStorage
    const driversData = JSON.parse(localStorage.getItem('drivers') || '[]');
    return driversData.find((driver: Record<string, unknown>) => driver.id === driverId) || null;
  }
};

export const addDriver = async (driverData: Partial<Driver>) => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .insert([driverData])
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding driver:', error);
    
    // Fallback to localStorage
    const driversData = JSON.parse(localStorage.getItem('drivers') || '[]');
    const newDriver = { ...driverData, id: Date.now().toString() };
    localStorage.setItem('drivers', JSON.stringify([...driversData, newDriver]));
    return newDriver;
  }
};

export const updateDriver = async (driverId: string, driverData: Partial<Driver>) => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .update(driverData)
      .eq('id', driverId)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating driver:', error);
    
    // Fallback to localStorage
    const driversData = JSON.parse(localStorage.getItem('drivers') || '[]');
    const updatedDrivers = driversData.map((driver: Record<string, unknown>) => 
      driver.id === driverId ? { ...driver, ...driverData } : driver
    );
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    return updatedDrivers.find((driver: Record<string, unknown>) => driver.id === driverId);
  }
};

export const deleteDriver = async (driverId: string) => {
  try {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', driverId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting driver:', error);
    
    // Fallback to localStorage
    const driversData = JSON.parse(localStorage.getItem('drivers') || '[]');
    const updatedDrivers = driversData.filter((driver: Record<string, unknown>) => driver.id !== driverId);
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    return { success: true };
  }
};

// Guides Management
export const getAllGuides = async () => {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all guides:', error);
    
    // Fallback to localStorage
    const guidesData = localStorage.getItem('guides');
    return guidesData ? JSON.parse(guidesData) : [];
  }
};

export const getGuideById = async (guideId: string) => {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('id', guideId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting guide:', error);
    
    // Fallback to localStorage
    const guidesData = JSON.parse(localStorage.getItem('guides') || '[]');
    return guidesData.find((guide: Record<string, unknown>) => guide.id === guideId) || null;
  }
};

export const addGuide = async (guideData: Partial<Guide>) => {
  try {
    const { data, error } = await supabase
      .from('guides')
      .insert([guideData])
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding guide:', error);
    
    // Fallback to localStorage
    const guidesData = JSON.parse(localStorage.getItem('guides') || '[]');
    const newGuide = { ...guideData, id: `guide-${Date.now()}` };
    localStorage.setItem('guides', JSON.stringify([...guidesData, newGuide]));
    
    // Also update disassemblyGuides if it's that type
    if (guideData.category === 'Hardware') {
      const disassemblyGuides = JSON.parse(localStorage.getItem('disassemblyGuides') || '[]');
      const newDisassemblyGuide = {
        id: newGuide.id,
        title: guideData.title,
        model: guideData.device_model || "Generic",
        category: guideData.category,
        difficulty: (guideData.difficulty || "beginner").toLowerCase(),
        time: guideData.estimated_time || "30 minutes",
        description: guideData.description,
        steps: JSON.parse(guideData.content || '[]'),
        createdBy: guideData.author_id ? "user" : "system"
      };
      localStorage.setItem('disassemblyGuides', JSON.stringify([...disassemblyGuides, newDisassemblyGuide]));
    }
    
    return newGuide;
  }
};

export const updateGuide = async (guideId: string, guideData: Partial<Guide>) => {
  try {
    const { data, error } = await supabase
      .from('guides')
      .update(guideData)
      .eq('id', guideId)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating guide:', error);
    
    // Fallback to localStorage
    const guidesData = JSON.parse(localStorage.getItem('guides') || '[]');
    const updatedGuides = guidesData.map((guide: Record<string, unknown>) => 
      guide.id === guideId ? { ...guide, ...guideData } : guide
    );
    localStorage.setItem('guides', JSON.stringify(updatedGuides));
    
    // Also update disassemblyGuides if necessary
    const disassemblyGuides = JSON.parse(localStorage.getItem('disassemblyGuides') || '[]');
    if (disassemblyGuides.some((guide: Record<string, unknown>) => guide.id === guideId)) {
      const updatedDisassemblyGuides = disassemblyGuides.map((guide: Record<string, unknown>) => 
        guide.id === guideId 
          ? {
              ...guide,
              title: guideData.title || guide.title,
              description: guideData.description || guide.description,
              category: guideData.category || guide.category,
              difficulty: ((guideData.difficulty as string) || guide.difficulty as string).toLowerCase(),
              steps: guideData.content ? JSON.parse(guideData.content) : guide.steps
            } 
          : guide
      );
      localStorage.setItem('disassemblyGuides', JSON.stringify(updatedDisassemblyGuides));
    }
    
    return updatedGuides.find((guide: Record<string, unknown>) => guide.id === guideId);
  }
};

export const deleteGuide = async (guideId: string) => {
  try {
    const { error } = await supabase
      .from('guides')
      .delete()
      .eq('id', guideId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting guide:', error);
    
    // Fallback to localStorage
    const guidesData = JSON.parse(localStorage.getItem('guides') || '[]');
    const updatedGuides = guidesData.filter((guide: Record<string, unknown>) => guide.id !== guideId);
    localStorage.setItem('guides', JSON.stringify(updatedGuides));
    
    // Also update disassemblyGuides if necessary
    const disassemblyGuides = JSON.parse(localStorage.getItem('disassemblyGuides') || '[]');
    const updatedDisassemblyGuides = disassemblyGuides.filter((guide: Record<string, unknown>) => guide.id !== guideId);
    localStorage.setItem('disassemblyGuides', JSON.stringify(updatedDisassemblyGuides));
    
    return { success: true };
  }
};

// File Storage with Supabase Storage
export const uploadFile = async (bucketName: string, filePath: string, file: File) => {
  try {
    // Try to create bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
    
    // It's okay if the bucket already exists
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating bucket:', bucketError);
    }
    
    // Upload file to storage
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFileUrl = (bucketName: string, filePath: string) => {
  try {
    const { data } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

export const deleteFile = async (bucketName: string, filePath: string) => {
  try {
    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};