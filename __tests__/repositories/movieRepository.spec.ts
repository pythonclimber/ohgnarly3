import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {MovieRepository} from '../../repositories/movieRepository';
import {Movie} from '../../models/movie';

dotenv.config();

describe('movieRepository', () => {
    let movieRepository: MovieRepository;

    beforeEach(async () => {
        movieRepository = new MovieRepository();
        await mongoose.connect(process.env.CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true});
    });

    describe('getMoviesForUser', () => {
        it('should return 6 movies for user 321', async () => {
            const movies = await movieRepository.getMoviesForUser('321');
            expect(movies).toHaveLength(6);
        });
    });

    describe('CRUD operations', () => {
        let movie: Movie;
        beforeEach(() => {
            movie = {
                title: 'Rushmore',
                description: '',
                userId: '456',
                director: 'Wes Anderson',
                favorite: false,
                wishlist: false,
                imdbid: 'tt321654',
                format: 'Blu-ray',
                rating: 0,
                poster: 'https://m.media-amazon.com/images/M/MV5BMjQ0MTgyNjAxMV5BMl5BanBnXkFtZTgwNjUzMDkyODE@._V1_SX300.jpg',
            };
        });

        it('should add one movie', async () => {
            const added = await movieRepository.add(movie);
            expect(added._id).toBeTruthy();
        });

        it('should return inserted movie', async () => {
            const queried = await movieRepository.get('456', 'tt321654');
            expect(queried.title).toEqual('Rushmore');
            expect(queried.rating).toEqual(0);
        });

        it('should update one movie', async () => {
            movie.rating = 10;
            const updated = await movieRepository.update('456', 'tt321654', movie);
            expect(updated.rating).toEqual(10);
        });

        it('should delete movie', async () => {
            const deleted = await movieRepository.delete('456', 'tt321654');
            expect(deleted).toBeTruthy();
        });

        it('should be missing', async () => {
            const queried = await movieRepository.get('456', 'tt321654');
            expect(queried).toBeFalsy();
        });
    });

    // describe('getOnlineDetails', () => {
    //     it('should return The Royal Tenenbaums', async () => {
    //         const imdbMovie = await movieRepository.getOnlineDetails('tt0265666');
    //         expect(imdbMovie.title).toEqual('The Royal Tenenbaums');
    //     });
    // });

    // describe('searchOnline', () => {
    //     it('should return search results', async () => {
    //         const searchResults = await movieRepository.searchOnline('Hello', 1);
    //         expect(searchResults.results.length).toEqual(10);
    //     });
    // });

    afterEach(async () => {
        await mongoose.disconnect();
    });
});