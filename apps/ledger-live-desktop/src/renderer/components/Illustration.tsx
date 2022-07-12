import React from "react";
import { ThemedComponent } from "renderer/styles/StyleProviderV3";
import styled, { DefaultTheme, ThemeProps } from "styled-components";

type Props = {
  lightSource: string;
  darkSource: string;
  size: number;
};

const defineStyleFromTheme = (lightAsset: string, darkAsset: string) => (
  p: ThemeProps<DefaultTheme>,
) => (p.theme.colors.palette.type === "light" ? lightAsset : darkAsset);

const Illustration = ({ lightSource, darkSource, size }: Props) => {
  const Img: ThemedComponent<{}> = styled.div`
    background: url(${p => defineStyleFromTheme(lightSource, darkSource)(p)});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    width: ${size}px;
    height: ${size}px;
  `;

  return <Img />;
};

export default Illustration;
