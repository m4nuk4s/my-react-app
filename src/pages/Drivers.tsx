useEffect(() => {
  const fetchDriversWithFiles = async () => {
    setLoading(true);
    try {
      const { data: dbDrivers, error: driversError } = await supabase
        .from('drivers')
        .select('*');

      const { data: dbFiles, error: driverFilesError } = await supabase
        .from('driver_files')
        .select('*');

      if (driversError || driverFilesError) {
        console.error('Supabase error:', driversError || driverFilesError);
        toast.error('Error loading drivers from database.');
        setDrivers([]);
        return;
      }

      if (!dbDrivers || dbDrivers.length === 0) {
        toast.warning('No drivers found in database.');
        setDrivers([]);
        return;
      }

      const driversData = dbDrivers.map(driver => {
        const files = dbFiles?.filter(file => file.driver_id === driver.id) || [];
        return {
          ...driver,
          image_url: driver.image_url || driver.image || '/placeholder-driver.png',
          os_version: driver.os_version || driver.os || 'Unknown',
          size: driver.size || driver.total_size || 'Unknown',
          release_date: driver.release_date || driver.date || driver.created || 'Unknown',
          files
        };
      });

      setDrivers(driversData);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Unexpected error loading drivers.');
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  fetchDriversWithFiles();
}, []);
