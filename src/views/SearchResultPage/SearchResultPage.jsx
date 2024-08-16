import { useLocation } from 'react-router-dom';
import './SearchResultPage.css';

export default function SearchResultPage() {
    const location = useLocation();
    const results = location.state?.results || {
        threads: [],
        users: [],
    };

    const noResultsFound = results.threads.length === 0 && results.users.length === 0;

    return (
        <div className="search-results-container">
            <h2>Search Results:</h2>
            {noResultsFound ? (
                <p className="no-results-message">No results found.</p>
            ) : (
                <>
                    {results.users.length > 0 && (
                        <div className="user-results-section">
                            <h3>User Results:</h3>
                            <ul>
                                {results.users.map((user) => (
                                    <li key={user.uid}>
                                        <UserInfo userAuthor={user} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.threads.length > 0 && (
                        <div className="thread-results-section">
                            <h3>Thread Results:</h3>
                            <ul>
                                {results.threads.map((thread) => (
                                    <li key={thread.id}>
                                        <ThreadItem thread={thread} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
