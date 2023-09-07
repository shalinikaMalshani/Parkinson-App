import { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Paper, CardActionArea, CardMedia, Grid, TableContainer, Table, TableBody, TableHead, TableRow, TableCell, Button, CircularProgress } from "@material-ui/core";
//import cblogo from "./cblogo.PNG";
import image from "./bg1.jpg";
import { DropzoneArea } from 'material-ui-dropzone';
import { common } from '@material-ui/core/colors';
import Clear from '@material-ui/icons/Clear';




const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(common.white),
    backgroundColor: common.white,
    '&:hover': {
      backgroundColor: '#ffffff7a',
    },
  },
}))(Button);
const axios = require("axios").default;

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  clearButton: {
    width: "-webkit-fill-available",
    borderRadius: "15px",
    padding: "15px 22px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
  },

  Appfooter :{
    background: 'black',
    color: 'white',
    padding: '10px',
  },

  customDropzone: {
    backgroundColor: 'black',
    color: 'white',
  },
  root: {
    maxWidth: 345,
    flexGrow: 1,
  },
  media: {
    height: 400,
  },

  blackText: {
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    padding:'90px',
    color: 'black', // Set the text color to black
    fontFamily: 'Arial, sans-serif', // Set a nice font
    fontSize: '18px', // Set the font size
    fontWeight: 'bold', // Add bold text
    textAlign: 'center', // Center-align the text
    margin: '20px 0'
  },

  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    maxWidth: 500,
  },
  gridContainer: {
    justifyContent: "center",
    padding: "4em 1em 0 1em",
  },
  mainContainer: {
    background: 'white', // Set the background color to white
    height: "93vh",
    marginTop: "8px",
  },
  dragAndDropText: {
    color: '#333', // Set the text color to a contrasting color
    textAlign: 'center',
    fontSize: '16px',
  },
  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 400,
    backgroundColor: 'transparent',
    boxShadow: '0px 5px 40px 0px rgb(0 0 0 / 30%) !important',
    borderRadius: '5px',
    outlineColor:'black',
  },
  imageCardEmpty: {
    height: 'auto',
  },

  detailinside:{
    marginBottom: '20px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    fontSize:'150px' 
  },
  
  noImage: {
    margin: "auto",
    width: 400,
    height: "400 !important",
  },
  input: {
    display: 'none',
  },
  uploadIcon: {
    background: 'white',
  },
  tableContainer: {
    backgroundColor: 'white', // Set the background color to white
    boxShadow: 'none !important',
    padding: '20px', // Add padding for spacing
    borderRadius: '15px', // Add rounded corners
    fontFamily: 'Arial, sans-serif', // Set a nice font
  },

  table: {
    backgroundColor: 'transparent !important',
  },
  tableHead: {
    backgroundColor: 'transparent !important',
  },
  tableRow: {
    backgroundColor: 'transparent !important',
  },
  tableCell: {
    fontSize: '22px',
    backgroundColor: 'transparent !important',
    borderColor: 'transparent !important',
    color: '#000000a6 !important',
    fontWeight: 'bolder',
    padding: '1px 24px 1px 16px',
  },
  tableCell1: {
    fontSize: '14px',
    backgroundColor: 'transparent !important',
    borderColor: 'transparent !important',
    color: '#000000a6 !important',
    fontWeight: 'bolder',
    padding: '1px 24px 1px 16px',
  },
  tableBody: {
    backgroundColor: 'transparent !important',
  },
  text: {
    color: 'white !important',
    textAlign: 'center',
  },
  buttonGrid: {
    maxWidth: "416px",
    width: "100%",
  },
  detail: {
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },

  /* Add this CSS in your stylesheet */
result : {
    border: '2px solid black',
    padding: '20px',
    width:'570px',
    height:'500px',
    boxSizing: 'border-box',
    borderRadius:'5px' ,
    display: 'flex',
    flexDirection: 'column', // Stack items vertically
    justifyContent: 'space-between',
  },
  
  appbar: {
    background: 'black',
    boxShadow: 'none',
    color: 'white'
  },

  labelSpan: {
    fontWeight: 'bold', // Add bold text
    fontSize: '24px', // Increase font size
    marginRight: '10px', // Add spacing between label and prediction
  },

  loader: {
    color: '#be6a77 !important',
  },
  greenText:{
    fontWeight:'bold',
    color:'green',
    fontSize: '20px'
  },
  redText:{
    fontWeight:'bold',
    color:'red',
    fontSize: '20px'
  }
}));
export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  

  const sendFile = async () => {
    if (image) {
      let formData = new FormData();
      formData.append("file", selectedFile);
      let res = await axios({
        method: "post",
        url: process.env.REACT_APP_API_URL,
        data: formData,
      });
      if (res.status === 200) {
        setData(res.data);
      }
      setIsloading(false);
    }
  }

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) {
      return;
    }
    setIsloading(true);
    sendFile();
  }, [preview]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(files[0]);
    setData(undefined);
    setImage(true);
  };

  // if (data) {
  //   confidence = (parseFloat(data.Confidence) * 100).toFixed(2);
  // }

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            NeuraTrace PD : Parkinson Diseases Prediction 
          </Typography>
          <div className={classes.grow} />
          {/* <Avatar src={cblogo}></Avatar> */}
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} className={classes.mainContainer} disableGutters={true}>
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          {/* Image Upload Section */}
          <Grid item xs={12} sm={6}> {/* Set the width for small screens */}
            <Card className={`${classes.imageCard} ${!image ? classes.imageCardEmpty : ''}`}>
              {image && <CardActionArea>
                <CardMedia
                  className={classes.media}
                  image={preview}
                  component="image"
                  title="Contemplative Reptile"
                />
              </CardActionArea>
              }
              {!image && (
  <CardContent className={classes.content}>
    <DropzoneArea
      acceptedFiles={['image/*']}
      dropzoneText={"Drag and drop an image of an MRI to process"}
      onChange={onSelectFile}
    />
  </CardContent>
)}
</Card>
          </Grid>

          {/* Result Display Section */}
          
          <Grid item xs={12} sm={6}> {/* Set the width for small screens */}
          <h2>Predicting Result</h2>
            <div className={classes.result}>
           
              

{data && <div className={classes.detail}>
<center>
          <TableContainer component={Paper} className={classes.tableContainer}>
                  <Table className={classes.table} size="small" aria-label="simple table">
                  <TableBody className={classes.tableBody}>
      <TableRow className={classes.tableRow}>
        <span className={classes.labelSpan}>Label:</span>
        <span className={data.prediction === 'Healthy' ? classes.greenText : classes.redText}>
          {data.prediction}
        </span>
      </TableRow>
    </TableBody>
                    
                  </Table>
                </TableContainer>
                </center>
              </div>}
              {isLoading && <div className={classes.detail}>
                <CircularProgress color="secondary" className={classes.loader} />
                <Typography className={classes.title} variant="h6" noWrap>
                  Processing
                </Typography>
              </div>}
            
              {data && <div className={classes.detail}>

{data.prediction === "Healthy" ? (
  <Typography variant="h6" className={classes.blackText}>
    The MRI suggests that the patient is Healthy.
  </Typography>
) : (
  <Typography variant="h6" className={classes.blackText}>

    The MRI suggests that the patient may have Parkinson.
  </Typography>
)}
              </div>}
          {data &&
                <div className={classes.detail} style={{ display: 'flex', justifyContent: 'center' }}> {/* Center the Clear button */} 
              <ColorButton variant="contained" className={classes.clearButton} color="primary" component="span" size="small" onClick={clearData} startIcon={<Clear fontSize="large" />}>
                Clear
              </ColorButton>
            </div>}
            </div>
          </Grid>
        </Grid>
        
      </Container >
      {/* Footer */}
      <footer className="Appfooter">
        <p>&copy; {new Date().getFullYear()} Your Company</p>
      </footer>
    </React.Fragment >
  );
};