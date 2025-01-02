import os, requests, pandas

link = "https://www.omdbapi.com"

def get_poster(title, year, id):
    params = {
        't': title,
        'y': year,
        'apikey': '3b0133ff' # who cares about this api key lol
    }
    response = requests.get(link, params=params)
    data = response.json()

    poster = ""
    if data['Response'] == "True":
        poster = data['Poster']

    with open('posters.csv', 'a') as outfile:
        outfile.write(f"{id},{poster}\n")

def main():
    movies_data = pandas.read_csv('movies.csv')
    movies_tuples = list(movies_data.itertuples(index=False, name=None))

    for data in movies_tuples:
        movie_id = int(data[0])
        movie_title = data[1]
        movie_year = int(data[3])
        get_poster(movie_title, movie_year, movie_id)

    get_poster("Avengers: Endgame", 2019, 98)

if __name__ == '__main__':
    main()
