import { createClient } from '@supabase/supabase-js';

class SupabaseClient {

    // for singleton class
    // public static getInstance(): SupabaseClient { 
    //     if (!SupabaseClient.instance) { 
    //         SupabaseClient.instance = new SupabaseClient(); 
    //     } 
    //     return SupabaseClient.instance; 
    // }

    // private static instance: SupabaseClient;
    public client;

    constructor() {
        this.client = createClient(process.env.REACT_APP_CONFIG_URL as string, process.env.REACT_APP_ANON_KEY as string)
    }
}

export default new SupabaseClient();