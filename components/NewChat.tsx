import React from "react";
import { Container, rem, useMantineTheme } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from 'react';
// import './StockGraph.css';

const stocks = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"];

function CardsCarousel({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const slides = React.Children.map(children, (theirChildren, index) => (
    <Carousel.Slide key={index}>{theirChildren}</Carousel.Slide>
  ));

  return (
    <Carousel
      slideSize="30.5%"
      breakpoints={[{ maxWidth: "sm", slideSize: "100%", slideGap: rem(2) }]}
      slideGap="xl"
      slidesToScroll={mobile ? 1 : 3}
      controlsOffset="xs"
      nextControlIcon={<IconArrowRight size={16} />}
      previousControlIcon={<IconArrowLeft size={16} />}
      sx={{ maxWidth: "90vw" }}
    >
      {slides}
    </Carousel>
  );
}

export default function NewChatCarousel() {
  return (
    <Container py="xl">
      <h2 style={{ textAlign: "center" }}>Current Financial Charts</h2>
      <CardsCarousel>
        {stocks.map((key) => {
          // @ts-ignore
          return (
            <div className="tradingview-widget">
              <iframe
                src={`https://s.tradingview.com/widgetembed/?symbol=${key}&interval=D&theme=light&style=1&locale=en&toolbar_bg=f1f3f6&hide_side_toolbar=false&allow_symbol_change=true&save_image=true&studies=[]`}
                width="100%"
                height="400"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          );
        })}
      </CardsCarousel>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h2> start by simply typing below</h2>
        <IconArrowDown style={{ marginLeft: "0.5rem" }} />
      </div>
    </Container>
  );
}
