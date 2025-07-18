/**
 * Helper function to fix and enhance the saving of driver files to the down1 table
 */
import { supabase } from './supabase';
import { fixDown1TableSchema } from './databaseFixes';
import { forceSchemaRefresh } from './schemaFix';

/**
 * DEBUG VERSION - Saves driver files to the down1 table with enhanced logging
 * IMPORTANT: This function should ONLY be used for additional files (file 2, file 3, etc.) NOT for file 1
 * @param {string} driverName - The name of the driver to link files with
 * @param {Array} driverFiles - Array of driver file objects (should NOT include file 1)
 * @param {Function} setStatusMessage - Function to update status messages
 * @returns {Promise<Object>} - Result of the save operation
 */
export async function saveDriverFilesToDown1Table(driverName, driverFiles, setStatusMessage = () => {}) {
  console.log("DEBUG: saveDriverFilesToDown1Table called with:", { driverName, fileCount: driverFiles?.length });
  
  if (!driverFiles || driverFiles.length === 0) {
    console.log("No driver files to save");
    return { success: true, savedCount: 0 };
  }
  
  // Safety check: Add extra verification that we're not trying to save file 1
  // This shouldn't happen if the caller is correct, but adding as a safety measure
  if (driverFiles.length === 1 && driverFiles[0]._isMainDriverFile === true) {
    console.warn("WARNING: Attempted to save main driver file (file 1) to down1 table. Skipping.");
    return { success: true, savedCount: 0, totalFiles: 1, skipped: "Prevented file 1 from being saved to down1" };
  }
  
  // Create a function to get authorization headers from Supabase client
  const getHeaders = () => {
    const headers = new Headers();
    // Make sure we're getting the actual keys from supabase instance
    const apiKey = supabase.supabaseKey || process.env.REACT_APP_SUPABASE_KEY || '';
    console.log("DEBUG: Using API Key (masked):", apiKey ? `${apiKey.substring(0, 5)}...` : "MISSING");
    
    headers.append('apikey', apiKey);
    headers.append('Authorization', `Bearer ${apiKey}`);
    headers.append('Content-Type', 'application/json');
    headers.append('Prefer', 'return=representation');
    return headers;
  };
  
  // Log the full Supabase client configuration (without sensitive data)
  console.log("DEBUG: Supabase URL:", supabase.supabaseUrl);
  console.log("DEBUG: Supabase client config:", {
    url: supabase.supabaseUrl,
    hasKey: !!supabase.supabaseKey,
    headers: Object.keys(supabase.headers || {})
  });
  
  // Get base URL for REST API calls
  const down1ApiUrl = `${supabase.supabaseUrl}/rest/v1/down1`;
  
  try {
    // DIRECT INSERT TEST - Try a direct test insert to validate the connection
    try {
      console.log("DEBUG: Attempting test insert to down1 table...");
      const testData = {
        file_name: "TEST_FILE_" + new Date().getTime(),
        version: "TEST",
        release_date: new Date().toISOString(),
        file_size: "1KB",
        download_link: "http://test.com",
        model: "TEST_MODEL_" + new Date().getTime()
      };
      
      const { data: testInsertData, error: testInsertError } = await supabase
        .from('down1')
        .insert(testData)
        .select();
      
      if (testInsertError) {
        console.error("DEBUG: Test insert failed with Supabase client:", testInsertError);
      } else {
        console.log("DEBUG: Test insert successful!", testInsertData);
        
        // Clean up the test entry
        try {
          await supabase.from('down1').delete().eq('id', testInsertData[0].id);
        } catch (e) {
          console.log("DEBUG: Could not delete test entry, but insert worked!");
        }
      }
    } catch (testError) {
      console.error("DEBUG: Test insert attempt failed:", testError);
    }
    
    // Ensure down1 table exists with correct schema
    setStatusMessage("Ensuring down1 table exists with correct schema...");
    const schemaResult = await fixDown1TableSchema();
    console.log("DEBUG: fixDown1TableSchema result:", schemaResult);
    await forceSchemaRefresh();
    
    // Delete any existing files for this driver
    setStatusMessage(`Removing any existing files for ${driverName}...`);
    try {
      console.log("DEBUG: Deleting existing down1 records for model:", driverName);
      
      // Try direct SQL execution first as the most reliable method
      try {
        const { error: sqlDeleteError } = await supabase.rpc(
          'execute_sql',
          { 
            sql_query: `DELETE FROM down1 WHERE model = '${driverName.replace(/'/g, "''")}'`
          }
        );
        
        if (sqlDeleteError) {
          console.warn("DEBUG: SQL delete failed:", sqlDeleteError);
        } else {
          console.log("DEBUG: SQL delete succeeded");
        }
      } catch (sqlError) {
        console.warn("DEBUG: SQL delete error:", sqlError);
      }
      
      // Fallback to Supabase client
      const { error: deleteError } = await supabase
        .from('down1')
        .delete()
        .eq('model', driverName);
      
      if (deleteError) {
        console.warn("DEBUG: Delete with Supabase client failed:", deleteError);
        
        // Try direct API as a backup
        try {
          const encodedName = encodeURIComponent(driverName);
          const deleteResponse = await fetch(`${down1ApiUrl}?model=eq.${encodedName}`, {
            method: 'DELETE',
            headers: getHeaders()
          });
          
          if (!deleteResponse.ok) {
            console.warn("DEBUG: Failed to delete with direct API:", await deleteResponse.text());
          } else {
            console.log("DEBUG: Successfully deleted with direct API");
          }
        } catch (error) {
          console.error("DEBUG: Error with direct API deletion:", error);
        }
      } else {
        console.log("DEBUG: Successfully deleted with Supabase client");
      }
    } catch (error) {
      console.error("DEBUG: Error during down1 cleanup:", error);
    }
    
    // Double check that we're not saving file 1
    const finalDriverFiles = driverFiles.filter(file => 
      !file._isMainDriverFile && 
      (file._isAdditionalFile === true || file._additionalFileIndex > 0)
    );
    
    console.log(`FINAL CHECK: Starting with ${driverFiles.length} files, filtered to ${finalDriverFiles.length} safe files`);
    if (finalDriverFiles.length === 0) {
      console.log("SAFETY: No valid additional files to save after final check");
      return { success: true, savedCount: 0, totalFiles: driverFiles.length, skipped: "All files filtered out in safety check" };
    }
    
    // Now insert only additional driver files with DIRECT SQL INSERTION
    setStatusMessage(`Inserting ${finalDriverFiles.length} additional driver files using direct SQL...`);
    let successCount = 0;
    
    // First try direct SQL insertion for all files at once
    try {
      // Build a multi-value insert SQL statement
      let sqlValues = finalDriverFiles.map(file => {
        const escapedName = (file.name || 'Unnamed').replace(/'/g, "''");
        const escapedVersion = (file.version || '1.0').replace(/'/g, "''");
        const escapedDate = (file.date || new Date().toISOString().split('T')[0]).replace(/'/g, "''");
        const escapedSize = (file.size || 'Unknown').replace(/'/g, "''");
        const escapedLink = (file.link || '#').replace(/'/g, "''");
        const escapedModel = driverName.replace(/'/g, "''");
        
        console.log(`SAFE FILE: Saving ${escapedName} as an additional file`);
        return `('${escapedName}', '${escapedVersion}', '${escapedDate}', '${escapedSize}', '${escapedLink}', '${escapedModel}')`;
      }).join(', ');
      
      const sqlQuery = `
        INSERT INTO down1 (file_name, version, release_date, file_size, download_link, model)
        VALUES ${sqlValues}
        RETURNING id;
      `;
      
      console.log("DEBUG: Executing SQL bulk insert");
      const { data: sqlResult, error: sqlError } = await supabase.rpc(
        'execute_sql',
        { sql_query: sqlQuery }
      );
      
      if (sqlError) {
        console.error("DEBUG: SQL bulk insert failed:", sqlError);
      } else {
        console.log("DEBUG: SQL bulk insert succeeded:", sqlResult);
        successCount = driverFiles.length; // All succeeded
        setStatusMessage(`Successfully saved all ${driverFiles.length} files via SQL`);
        return { success: true, savedCount: driverFiles.length, totalFiles: driverFiles.length };
      }
    } catch (sqlBulkError) {
      console.error("DEBUG: SQL bulk insert error:", sqlBulkError);
    }
    
    // Fallback to individual insertions
    setStatusMessage("Falling back to individual file insertions...");
    console.log("DEBUG: Attempting individual insertions");
    
    // Process files sequentially for better reliability
    for (const [index, file] of finalDriverFiles.entries()) {
      try {
        setStatusMessage(`Adding file ${index + 1}/${driverFiles.length}: ${file.name || "Unnamed file"}`);
        
        // Try SQL insertion first for each file
        try {
          const escapedName = (file.name || `Driver File ${index + 1}`).replace(/'/g, "''");
          const escapedVersion = (file.version || '1.0').replace(/'/g, "''");
          const escapedDate = (file.date || new Date().toISOString().split('T')[0]).replace(/'/g, "''");
          const escapedSize = (file.size || 'Unknown').replace(/'/g, "''");
          const escapedLink = (file.link || '#').replace(/'/g, "''");
          const escapedModel = driverName.replace(/'/g, "''");
          
          const singleSqlQuery = `
            INSERT INTO down1 (file_name, version, release_date, file_size, download_link, model)
            VALUES ('${escapedName}', '${escapedVersion}', '${escapedDate}', '${escapedSize}', '${escapedLink}', '${escapedModel}')
            RETURNING id;
          `;
          
          const { data: sqlSingleResult, error: sqlSingleError } = await supabase.rpc(
            'execute_sql',
            { sql_query: singleSqlQuery }
          );
          
          if (sqlSingleError) {
            console.warn(`DEBUG: SQL insert for file ${index + 1} failed:`, sqlSingleError);
          } else {
            console.log(`DEBUG: SQL insert for file ${index + 1} succeeded:`, sqlSingleResult);
            successCount++;
            continue; // Skip to next file
          }
        } catch (sqlSingleError) {
          console.warn(`DEBUG: SQL insert error for file ${index + 1}:`, sqlSingleError);
        }
        
        const fileData = {
          file_name: file.name || `Driver File ${index + 1}`,
          version: file.version || "1.0",
          release_date: file.date || new Date().toISOString().split('T')[0],
          file_size: file.size || "Unknown",
          download_link: file.link || "#",
          model: driverName
        };
        
        console.log(`DEBUG: Saving file ${index + 1} with Supabase client:`, fileData);
        
        // Try with direct RPC upsert method
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'upsert_down1',
            fileData
          );
          
          if (rpcError) {
            console.warn(`DEBUG: RPC upsert for file ${index + 1} failed:`, rpcError);
          } else {
            console.log(`DEBUG: RPC upsert for file ${index + 1} succeeded:`, rpcData);
            successCount++;
            continue; // Skip to next file
          }
        } catch (rpcError) {
          console.warn(`DEBUG: RPC upsert error for file ${index + 1}:`, rpcError);
        }
        
        // Try with Supabase client
        const { data: insertData, error: insertError } = await supabase
          .from('down1')
          .insert(fileData)
          .select();
        
        if (insertError) {
          console.warn(`DEBUG: Supabase client insert for file ${index + 1} failed:`, insertError);
          
          // Try with direct API as backup
          try {
            console.log(`DEBUG: Trying direct API for file ${index + 1}`);
            const insertResponse = await fetch(down1ApiUrl, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(fileData)
            });
            
            if (!insertResponse.ok) {
              const errorText = await insertResponse.text();
              console.error(`DEBUG: Direct API insert failed for file ${index + 1}:`, errorText);
              
              // Last resort: try a simplified version with minimal fields
              try {
                console.log(`DEBUG: Trying minimal data for file ${index + 1}`);
                const minimalData = {
                  file_name: file.name || `File ${index + 1}`,
                  version: file.version || "1.0",
                  download_link: file.link || "#",
                  model: driverName
                };
                
                const minimalResponse = await fetch(down1ApiUrl, {
                  method: 'POST',
                  headers: getHeaders(),
                  body: JSON.stringify(minimalData)
                });
                
                if (minimalResponse.ok) {
                  console.log(`DEBUG: Minimal insert succeeded for file ${index + 1}`);
                  successCount++;
                } else {
                  console.error(`DEBUG: All attempts failed for file ${index + 1}`);
                }
              } catch (minimalError) {
                console.error(`DEBUG: Minimal insert error for file ${index + 1}:`, minimalError);
              }
            } else {
              console.log(`DEBUG: Direct API insert succeeded for file ${index + 1}`);
              successCount++;
            }
          } catch (apiError) {
            console.error(`DEBUG: Direct API error for file ${index + 1}:`, apiError);
          }
        } else {
          console.log(`DEBUG: Supabase client insert succeeded for file ${index + 1}:`, insertData);
          successCount++;
        }
      } catch (fileError) {
        console.error(`DEBUG: Error processing file ${index + 1}:`, fileError);
      }
      
      // Small delay between operations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Create an RPC function for future use
    try {
      await supabase.rpc(
        'execute_sql',
        { 
          sql_query: `
            CREATE OR REPLACE FUNCTION upsert_down1(
              p_file_name TEXT,
              p_version TEXT,
              p_release_date TEXT,
              p_file_size TEXT,
              p_download_link TEXT,
              p_model TEXT
            ) RETURNS jsonb AS $$
            DECLARE
                result_id UUID;
            BEGIN
                INSERT INTO down1 (file_name, version, release_date, file_size, download_link, model)
                VALUES (p_file_name, p_version, p_release_date, p_file_size, p_download_link, p_model)
                RETURNING id INTO result_id;
                
                RETURN jsonb_build_object('id', result_id, 'success', true);
            EXCEPTION WHEN OTHERS THEN
                RETURN jsonb_build_object('error', SQLERRM, 'success', false);
            END;
            $$ LANGUAGE plpgsql;
          `
        }
      );
      console.log("DEBUG: Created upsert_down1 function for future use");
    } catch (rpcError) {
      console.warn("DEBUG: Could not create upsert function:", rpcError);
    }
    
    setStatusMessage(`Successfully saved ${successCount} of ${driverFiles.length} files to down1 table`);
    return { success: successCount > 0, savedCount: successCount, totalFiles: driverFiles.length };
    
  } catch (error) {
    console.error("DEBUG: Error saving driver files to down1 table:", error);
    setStatusMessage(`Error saving driver files: ${error.message || 'Unknown error'}`);
    return { success: false, error, savedCount: 0, totalFiles: driverFiles.length };
  }
}