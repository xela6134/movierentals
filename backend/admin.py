from dotenv import load_dotenv
import os, mysql.connector

load_dotenv()

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

movies_create = """
create table movies (
    id bigint unsigned not null auto_increment,
    title varchar(255) not null,
    director varchar(255) not null,
    released int not null,
    copies int not null,
    primary key (id)
)
"""

users_create = """
create table users (
    id bigint unsigned not null auto_increment,
    user_id varchar(255) not null unique,
    password varchar(255) not null,
    name varchar(255) not null,
    age int not null,
    is_admin boolean not null default false,
    suspended boolean not null default false,
    primary key (id)
)
"""

reviews_create = """
create table reviews (
    m_id bigint unsigned not null,
    u_id bigint unsigned not null,
    rating int not null,
    review text,
    primary key (m_id, u_id),
    foreign key (m_id) references movies(id),
    foreign key (u_id) references users(id)
)
"""

reservations_create = """
create table reservations (
    m_id bigint unsigned not null,
    u_id bigint unsigned not null,
    reservation_date date not null,
    primary key (m_id, u_id),
    foreign key (m_id) references movies(id),
    foreign key (u_id) references users(id)
)
"""

genres_create = """
create table genres (
    id bigint unsigned not null,
    genre text not null,
    foreign key (id) references movies(id)
)
"""

movie_posters_create = """
create table movie_posters (
    id bigint unsigned not null,
    img text not null,
    foreign key (id) references movies(id)
)
"""

def get_db_connection():
    return mysql.connector.connect(**config)

def main():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
