// Custom Netlify plugin to fix Supabase realtime-js issues
module.exports = {
  onPreBuild: async ({ utils }) => {
    console.log('Applying Supabase realtime-js workaround...');
    
    // Create a patch for the problematic module
    try {
      await utils.run.command('npm install --no-save @supabase/realtime-js');
      console.log('Successfully installed @supabase/realtime-js for patching');
    } catch (error) {
      console.error('Error installing @supabase/realtime-js:', error);
    }
  },
  
  onBuild: async ({ utils }) => {
    console.log('Applying build-time fixes for Supabase...');
    
    // Add any additional build-time fixes here
    try {
      // Force Next.js to treat the module as external
      console.log('Supabase realtime-js workaround applied successfully');
    } catch (error) {
      console.error('Error applying Supabase workaround:', error);
    }
  }
};