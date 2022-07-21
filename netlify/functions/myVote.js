const createClient = require('@supabase/supabase-js').createClient

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_SERVICE_KEY'];

exports.handler = async function(event, context) {

    if(event.httpMethod != 'GET') {
        return {
            statusCode: 302,
            headers: {
                Location: '/',
            }
        }
    } else {
        const email = context.clientContext?.user?.email;
        if(!email) {
            return {
                statusCode: 403,
                body: 'forbidden',
            }
        }
        const supabase = createClient(supabaseUrl, supabaseKey);

        let { data, error } = await supabase.from('votes').select('grand,api,tech-debt,big,accelerator,unbelievable,intelligent,suite,delight').eq('email', email);

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        }
    }

}