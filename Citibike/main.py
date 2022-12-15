import requests
import pandas as pd
from datetime import datetime

station_link = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json'

with requests.get(station_link) as url:
    json = url.json()
    station_status_df = pd.DataFrame(json['data']['stations']).set_index('station_id')
    timestamp = json['last_updated']
    dt = datetime.fromtimestamp(int(timestamp))
    station_status_df.to_csv(f'./data/{timestamp}.csv')


    print(f'Saved data for {len(station_status_df)} stations on {dt}')

