import React from "react";
import { useState } from "react";
import StepContainer from "../UIElements/StepContainer";
import styled, { css } from "styled-components";
import ReactLoading from 'react-loading';
import {useSelector,useDispatch} from 'react-redux';
import {setURL,setPage,clear} from '../Store/pageDataSlice';

const StepOne = (props) => {
  const [urlInput, setURLInput] = useState("Enter url here...");
  const [isDefault, setIsDefault] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage,setErrorMessage] = useState("");

  const dispatch = useDispatch()

  const onChangeHandler = (event) => {
    setURLInput(event.target.value);
    if (errorMessage.length > 0) {
      setErrorMessage("");
    }
  };

  const onFocusHandler = (event) => {
    if (isDefault || (errorMessage === "Invalid URL")) {
      setURLInput("");
      setIsDefault(false);
      setErrorMessage("");
    }
  };

  const onBlurHandler = (event) => {
    if (urlInput.length <= 0) {
      setIsDefault(true);
      setURLInput("Enter url here...");
    }
  };

  const urlSubmitHandler = async (event) => {
    console.log("submitting url");

    // string validation
    if (!validateHttpURL(urlInput)) {
      console.log("not a valid http url");
      setErrorMessage("Invalid URL")
      return;
    }

    if (isFetching) {
      return;
    }
    
    const api = "";
    const data = { url: urlInput };

    setIsFetching(true);
    fetch(api, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {

        if (!response.ok) {
            throw new Error("invalid response: status code " + response.status);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || (contentType.indexOf("application/json") < 0)) {
          throw new TypeError("fetched data was not json");
        }

        return response.json();
      })
      .then((jsonObject) => {

        setIsFetching(false);

        // data inspection and cleaning
        console.log(jsonObject);
        let cleanedData = jsonObject;

        // write data to store
        dispatch(setURL(urlInput));
        dispatch(setPage(cleanedData));
      })
      .catch(handleFetchError);
  };

  const handleFetchError = (error) => {
    console.log("Error during fetch: " + error);
    setIsFetching(false);
    setErrorMessage("Connection Error");
  };

  const validateHttpURL = (urlString) => {
    try {
      let urlObject = new URL(urlString);
      if (urlObject.protocol.indexOf("http") != 0) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <StepOneContainer>
      <URLInput
        value={urlInput}
        onChange={onChangeHandler}
        onFocus={onFocusHandler}
        onBlur={onBlurHandler}
        isDefault={isDefault}
      ></URLInput>
      <button onClick={urlSubmitHandler}> Submit </button>
      {isFetching && <ReactLoading type="spinningBubbles" color="gray" width={32} height={32}/>}
      {(errorMessage.length > 0) && <ErrorMessageLabel> {errorMessage} </ErrorMessageLabel>}
    </StepOneContainer>
  );
};

const URLInput = styled.input(
  (props) => css`
    width: 15rem;
    overflow: hidden;
    ${props.isDefault &&
    css`
      font-style: italic;
      color: rgba(0, 0, 0, 0.5);
    `}
  `
);

const ErrorMessageLabel = styled.div`
  color: red;
  font-size: 0.75rem;
`;

const StepOneContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 1.5rem;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
`

export default StepOne;
