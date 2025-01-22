import requests, pandas

link = "https://www.omdbapi.com"

def get_genre(title, year, id):
    params = {
        't': title,
        'y': year,
        'apikey': '3b0133ff' # who cares about this api key lol
    }
    response = requests.get(link, params=params)
    data = response.json()

    genres = []
    if data['Response'] == "True":
        genre_data = data['Genre'].split(", ")
        for genre in genre_data:
            genres.append(genre)

    with open('genres_new.txt', 'a') as outfile:
        for genre in genres:
            outfile.write(f"{id},{genre}\n")
            
    if len(genres) == 0:
        print(f"No genres for id {id}. Check manually")

def main():
    movies_data = pandas.read_csv('new_movies.csv')
    movies_tuples = list(movies_data.itertuples(index=False, name=None))

    for data in movies_tuples:
        movie_id = int(data[0])
        movie_title = data[1]
        movie_year = int(data[3])
        get_genre(movie_title, movie_year, movie_id)

if __name__ == '__main__':
    main()
