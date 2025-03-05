import React, { useEffect, useState } from "react";
import { Container } from "@mantine/core";

interface NewsCardProps {
    title: string;
    description: string;
    url: string;
    urlToImage?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, description, url, urlToImage }) => {
    return (
        <div style={styles.card}>
            {urlToImage && <img src={urlToImage} alt={title} style={styles.image} />}
            <div style={styles.content}>
                <h2 style={styles.title}>{title}</h2>
                <p style={styles.description}>{description}</p>
                <a href={url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    Read More
                </a>
            </div>
        </div>
    );
};

interface Article {
    title: string;
    description: string;
    url: string;
    urlToImage?: string;
}

const App: React.FC = () => {
    const [news, setNews] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(
                    "https://newsapi.org/v2/top-headlines?country=us&apiKey=dfbe8471453d476784f32af93449c9ba"
                );
                const data = await response.json();
                setNews(data.articles);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching news:", error);
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <Container py="xl">
            <div style={styles.container}>
                <header style={styles.header}>Latest News</header>
                <div style={styles.newsContainer}>
                    {loading ? (
                        <p style={styles.loading}>Loading...</p>
                    ) : (
                        news.map((article, index) => (
                            <NewsCard key={index} {...article} />
                        ))
                    )}
                </div>
            </div>
        </Container>
    );
};

const styles = {
    container: {
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        padding: "1rem",
        minHeight: "100vh",
    },
    header: {
        textAlign: "center" as "center",
        fontSize: "2rem",
        marginBottom: "1rem",
        color: "#333",
    },
    newsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1rem",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column" as "column",
    },
    image: {
        width: "100%",
        height: "200px",
        objectFit: "cover" as "cover",
    },
    content: {
        padding: "1rem",
        flexGrow: 1,
    },
    title: {
        fontSize: "1.2rem",
        margin: "0 0 0.5rem",
        color: "#333",
    },
    description: {
        fontSize: "1rem",
        margin: "0 0 1rem",
        color: "#666",
    },
    link: {
        fontSize: "1rem",
        color: "#007bff",
        textDecoration: "none",
    },
    linkHover: {
        textDecoration: "underline",
    },
    loading: {
        textAlign: "center" as "center",
        fontSize: "1.5rem",
        color: "#666",
    },
};

export default App;
