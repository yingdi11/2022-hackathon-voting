const createClient = require('@supabase/supabase-js').createClient

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_SERVICE_KEY'];

const requiredDomain = '@domain.com';

exports.handler = async function(event, context) {

    if(event.httpMethod != 'POST') {
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
                body: 'Not authenticated'
            }
        } else if(!email.endsWith(requiredDomain)) {
            return {
                statusCode: 403,
                body: `Must use ${requiredDomain} email address!`,
            }
        }
        const result = new URLSearchParams(event.body);

        const categories = [
            'grand',
            'api',
            'tech-debt',
            'big',
            'accelerator',
            'unbelievable',
            'intelligent',
            'suite',
            'delight',
        ];

        const team = result.get('team');

        const vote = {email};

        if(vote.email && vote.email.endsWith(requiredDomain)) {
            for(const category of categories) {
                vote[category] = Array.from(new Set(result.getAll(category)));
            }

            console.log('recording vote: ', JSON.stringify(vote));
            console.log('team: ', team);

            const supabase = createClient(supabaseUrl, supabaseKey);
            const {data, error} = await supabase.from('votes').upsert(vote);
            const {data2, error2} = await supabase.from('teams').upsert({'team': team, 'email': email});

            return {
                statusCode: 200,
                body: 'Success!',
            }
        }

        return {
            statusCode: 403,
            body:"Invalid email address",
        }


    }

}
