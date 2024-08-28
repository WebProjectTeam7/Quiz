/* eslint-disable react/no-unescaped-entities */
import './Home.css';
import quizFriendsImg from '../../images/home-home-play-with-friends.png';
import funAndEngagingImg from '../../images/home-funny.png';
import competitiveAndExciting from '../../images/home-competitive.png';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/app.context';
import { useContext } from 'react';

export default function Home() {
    const navigate = useNavigate();
    const { userData } = useContext(AppContext);

    // const handleJoinNow = () => {
    //     navigate('/tournament');
    // };

    const handleGoToQuizzes = () => {
        navigate('/quizzes');
    };

    const handleGoToBattle = () => {
        navigate('/tournament');
    };

    const handleGoToQuestion = () => {
        navigate('/tournament'); /* must create a questions and after that add nav*/
    };
    return (
        <div className="main-page">
            <h1>Bee Champion</h1>
            {userData && <span className="welcome-text">Welcome, {userData.username}</span>}
            <section className="hero-banner">
                <h1>Challenge Your Mind with Fun Quizzes</h1>
                <p>Play quizzes with up to 4 players. Each question has a 20-second timer!</p>
                { /* <button className="cta-button" onClick={handleJoinNow}>Join Now</button> */ }
            </section>

            <section className="how-it-works">
                <h2>How It Works</h2>
                <div className="steps">
                    <div className="step">
                        <h3>Select a Quiz</h3>
                        <p>Choose from a variety of exciting quizzes.</p>
                        <button className='home-page-quizzes' onClick={handleGoToQuizzes}>Go to quizzes</button>
                    </div>
                    <div className="step">
                        <h3>Join the Game</h3>
                        <p>Play with up to 4 players in real-time.</p>
                        <button className='home-page-tournament' onClick={handleGoToBattle}>Join now</button>
                    </div>
                    <div className="step">
                        <h3>Answer Questions</h3>
                        <p>Each question has a 20-second timer. Answer quickly!</p>
                        <button className='home-page-question' onClick={handleGoToQuestion}>Go to question</button>
                    </div>
                </div>
            </section>

            <section className="benefits">
                <h2>Why Choose Us?</h2>
                <div className="benefit-item">
                    <img src={funAndEngagingImg} alt='Fun and Engaging' />
                    <h3>Fun Quizzes</h3>
                </div>
                <div className="benefit-item">
                    <img src={quizFriendsImg} alt='Play with Friends' />
                    <h3>Play with Friends</h3>
                </div>
                <div className="benefit-item">
                    <img src={competitiveAndExciting} alt='Competitive and Exciting' />
                    <h3>Competitive and Exciting</h3>
                </div>
            </section>

            <section className="current-quizzes">
                <h2>Current Quizzes</h2>
                <div className="quiz-list">
                    <div className="quiz-item">
                        <h3>General Knowledge</h3>
                        <p>Test your knowledge on various topics!</p>
                    </div>
                    <div className="quiz-item">
                        <h3>Quiz Battle</h3>
                        <p>Challenge yourself with friends!</p>
                    </div>
                    <div className="quiz-item">
                        <h3>Quiz of the week!</h3>
                        <p>Play the best quiz of the week!</p>
                    </div>
                </div>
            </section>

            <section className="testimonials">
                <h2>What Our Players Say</h2>
                <div className="testimonial-item">
                    <p>"A fantastic way to test my knowledge and have fun with friends!"</p>
                </div>
                <div className="testimonial-item">
                    <p>"The 20-second timer makes the game thrilling and fast-paced."</p>
                </div>
            </section>

            <footer className="footer">
                <p>&copy; 2024 Quiz Bee Champion</p>
                <a href="/contact">Contact Us</a> | <a href="/faq">FAQ</a>
            </footer>
        </div>
    );
}
