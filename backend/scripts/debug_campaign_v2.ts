const fs = require('fs');
import axios from 'axios';

async function log(msg: string) {
    console.log(msg);
    fs.appendFileSync('debug_log.txt', msg + '\n');
}

async function test() {
    try {
        fs.writeFileSync('debug_log.txt', 'Starting debug...\n');
        await log('Fetching all campaigns...');
        const res = await axios.get('http://localhost:3000/api/campaigns');
        await log(`Campaigns count: ${res.data.length}`);

        if (res.data.length === 0) {
            await log('No campaigns found.');
            return;
        }

        const firstCampaign = res.data[0];
        await log(`First Campaign ID: ${firstCampaign.id} (${typeof firstCampaign.id})`);

        await log(`Fetching details for campaign ${firstCampaign.id}...`);
        try {
            const detailRes = await axios.get(`http://localhost:3000/api/campaigns/${firstCampaign.id}`);
            await log(`Campaign Details Found: ${detailRes.data.title}`);
            await log(`Response Data: ${JSON.stringify(detailRes.data, null, 2)}`);
        } catch (detailErr: any) {
            await log(`Error fetching details: ${detailErr.message}`);
            if (detailErr.response) {
                await log(`Status: ${detailErr.response.status}`);
                await log(`Data: ${JSON.stringify(detailErr.response.data, null, 2)}`);
            }
        }

    } catch (err: any) {
        fs.appendFileSync('debug_log.txt', 'Global Error: ' + JSON.stringify(err, null, 2) + '\n');
    }
}

test();
