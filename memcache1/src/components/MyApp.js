import React, { PureComponent } from 'react';
import MyButton from '../scenes/myButton';
import ShowList from './ShowList';
import data from '../data';
import axios from 'axios';
import styled from '@emotion/styled';

const Perimeter = styled.div`
    display: flex;
    justify-content: space-around;
    border: 3px black solid;
`;

const Left = styled.div`
    border: 3px red solid;
    width: 100%;
`;

const Right = styled.div`
    border: 3px red solid;
    width: 100%;
`;


class MyApp extends PureComponent {
    constructor(props) {
        super(props)
        this.addKeyValuePair = this.addKeyValuePair.bind(this);
        this.state = {
          key:"",
          value:"",
          data: [],
          memCacheData: [],
        }
    }

    componentWillMount(){
        //Here I will perform the axios operation to update the state to display the result
        this.getDbData();
        this.getMemCacheData();
    }

    componentDidMount(){
        setInterval(() => {
            this.getDbData();
            this.getMemCacheData();
          }, 5000);
    }

    getDbData = () => {
        let url=`http://localhost:5000/show`;
        axios.post(url)
        .then(res=> {
            let dict = res.data;
            let key = "";
            let val = "";
            let database = [];
            for(let pair in dict){
                key = pair;
                val = dict[key];
                database.push({
                    key: key,
                    value: "",
                    open: false,
                })
            }
            this.setState({
                data: database,
            })
        })
        .catch(e => {
            console.log(e);
        })
    }

    updateText = (e, x) => {
        if(x === 'key'){
            this.setState({
                key: e.target.value,
            })
        }else if(x === 'value'){
            this.setState({
                value: e.target.value,
            })
        }else{
            console.log('404: Error Not Found');
        }
    }

    getMemCacheData = async() => {
        console.log('Retrieving data from the memcache');
        let url = `http://localhost:5000/mem`;
        let arr=[];
        await axios.get(url)
        .then(res => {
            let data = res.data;
            for(let key in data){
                let k = key;
                let v = data[k];
                arr[v]=k;
            }
            this.setState({
                memCacheData: arr,
            })
        })
        .catch(e => {
            console.error(e);
        })
    }

    addKeyValuePair = async() => {
        console.log('Enter the key details to the database');
        
        let url=`http://127.0.0.1:5000/set?key=${this.state.key}&value=${this.state.value}`;
        await axios.get(url)
        .then(res=> {
            console.log(res);
        })
        .catch(e => {
            console.log(e);
        })
        this.setState({
            key:"",
            value:"",
        })

        this.getDbData();
        this.getMemCacheData();
    }

    deleteKeyValuePair = async(id) => {
        let url=`http://127.0.0.1:5000/delete?key=${id}`;
        await axios.post(url)
        .then(res => {
            console.log(res);
        })
        .catch(e => {
            console.error(e);
        })
        this.getDbData();
        this.getMemCacheData();
    }

    flushData = async() => {
        let url=`http://127.0.0.1:5000/mem/flush`;
        await axios.post(url)
        .then(res => {
            console.log(res);
        })
        .catch(e => {
            console.error(e);
        })
        this.getMemCacheData();
    }

    listOnClick = async(x) => {
        let url=`http://127.0.0.1:5000/get?key=${x}`;
            await axios.get(url)
            .then(res => {
                this.setState({
                    data: this.state.data.map(d => {
                        if(d.key === x){
                            d.open=!d.open;
                            d.value = res.data;
                        }
                        return d;
                    })
                })
            })
            .catch(e => {
                console.log(e);
            })
    }

    render() {
        return (
            <div>
                <h1>Implementation of the memcache protocol using React and Python</h1>
                <input type="text" value={this.state.key} onChange={(e) => this.updateText(e, 'key')} placeholder="key"></input>
                <input type="text" value={this.state.value} onChange={(e) => this.updateText(e, 'value')} placeholder="value"></input>
                <MyButton execute={this.addKeyValuePair}>Add</MyButton>
                <Perimeter>
                    <Left>
                        <h3>Keys in Memcache</h3>
                        <ShowList state={this.state} dType={'mcData'}></ShowList>
                        <button onClick={this.flushData}>Flush All</button>
                    </Left>
                    <Right>
                        <h3>Data in Database</h3>
                        <ShowList listPress={this.listOnClick} state={this.state} deleteKey={this.deleteKeyValuePair} dType={'dbData'}></ShowList>
                    </Right>
                </Perimeter>
            </div>
        )
    }
}

export default MyApp