import React from 'react'
import styled from '@emotion/styled';

const StyledDiv= styled.div`
   
`;

const StyledUl = styled.ul`
    padding: 1.5em 1.5em;
    list-style-type: none;
    text-align: center;
`;

const Perimeter = styled.div`
    display: flex;
`;

const Keys = styled.span`
&:hover{
    background: purple;
}
`;

const Delete = styled.span`
    float:right;
    &:hover{
        background: red;
    }
`;

const StyledLi = styled.li`
    flex: 0 1 100%;
`;

const StyledItem = styled.div`
    border: 1px black solid;
    margin: 1px 0px;
    color: white;
    cursor: pointer;
    display:flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 1.01em;
    letter-spacing: .2em;
    transition: all .3s;
    &:nth-of-type(n){
        background: rgb(0,0,${props => props.i});
    }
    &:hover{
        background: #444444;
        transform: scale(1.03, 1.03);
    }
`;

const ShowList = ({listPress, state, dType, deleteKey}) => {
    if(dType === 'mcData'){
        return(
            <MemList state={state}></MemList>
        )
    }
    else{
        return(
            <DbData listPress={listPress} deleteKey={deleteKey} state={state}></DbData>
        )
    }
}

const DbData = ({listPress, deleteKey, state}) => {
    let data = state.data;
    return (
        <StyledDiv>
            <StyledUl>
              {data.map((ob, index) => {
                  return (
                    <StyledItem i={200}> 
                        <Perimeter>
                            <StyledLi key={ob.key} >
                                <Keys onClick={listPress.bind(null, ob.key)}>{ob.key}</Keys>
                            </StyledLi>
                            <Delete onClick={deleteKey.bind(null, ob.key)}>DEL</Delete>
                        </Perimeter>
                        {ob.open === true ? <div><StyledLi key={ob.key}>{ob.value}</StyledLi></div>:''}
                    </StyledItem>
                  )
              })}
            </StyledUl>
        </StyledDiv>
    )
}

const MemList = ({state}) => {
    let data = state.memCacheData;
    return(
        <StyledDiv>
            <StyledUl >
              {data.map((ob, index) => {
                  return (
                    <StyledItem i={200/((index+1)*0.4)}>
                        <StyledLi key={index}>{ob}</StyledLi>
                    </StyledItem>
                  )
              })}
            </StyledUl>
        </StyledDiv>
    )
}

export default ShowList
