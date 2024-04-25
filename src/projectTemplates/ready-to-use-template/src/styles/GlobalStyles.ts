import { createGlobalStyle } from 'styled-components'
import { theme } from './Theme'

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
	  vertical-align: baseline;
  }

  html {
    font-family: ${(props) => props.theme.fonts.principal}, sans-serif;
  }

  body {
    position: relative;
    line-height: 1;
    font-family: ${theme.fonts.principal};
    width: 100%;
    overflow-x: hidden;
    background-color: ${theme.colors.white};
  }

  ol, ul {
    list-style: none;
  }

  a {
    text-decoration: none;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: ${theme.fonts.principal};
  }
  
  input {
    font-family: ${theme.fonts.principal};
    outline: none;
  }

  select {
    border: none;
    outline: none;
  }

  fieldset {
    border: none;
  }

  input:disabled {
    cursor: not-allowed;
  }

  /* input:-webkit-autofill {
    -webkit-background-clip: text;
  } */

  input[type='text'],
  input[type='email'],
  input[type='tel'] {
    padding: 0.625rem;
  }

  img {
    max-width: 100%;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${theme.colors.blue800};
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${theme.colors.blue800};
  }

  &::-webkit-scrollbar-track {
    background-color: ${theme.colors.black50};
  }
`
