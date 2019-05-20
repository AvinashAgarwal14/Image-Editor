import React, {Component} from "react";
import Cropper from 'cropperjs';
import 'font-awesome/css/font-awesome.min.css';
import './imageEditor.css';
import 'cropperjs/dist/cropper.css';

class ImageEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data : {
                cropped: false,
                cropping: false,
                loaded: false,
                name: '',
                previousUrl: '',
                type: '',
                url: '',
            }
        } ;

        this.canvasData = null;
        this.cropBoxData = null;
        this.croppedData = null;
        this.cropper = null;
    }

    cropperSetup=()=>{

        const image = document.getElementsByClassName('image')[0];
        this.cropper = new Cropper(image, {
            autoCrop: false,
            dragMode: 'move',
            background: false,
  
            ready: () => {
              if (this.croppedData) {
                this.cropper
                  .crop()
                  .setData(this.croppedData)
                  .setCanvasData(this.canvasData)
                  .setCropBoxData(this.cropBoxData);
  
                this.croppedData = null;
                this.canvasData = null;
                this.cropBoxData = null;
              }
            },
  
            crop: ({ detail }) => {
              if (detail.width > 0 && detail.height > 0 && !this.state.data.cropping) {
                this.update({
                  cropping: true,
                });
              }
            },
          });
    }

    stop() {
        if (this.cropper) {
            this.cropper.destroy();
            this.canvasData = null;
            this.cropBoxData = null;
            this.croppedData = null;
            this.cropper = null;
        }
    }

    crop = () => {
        const { cropper} = this;
        const { data } = this.state;

        if (data.cropping) {
            this.croppedData = cropper.getData();
            this.canvasData = cropper.getCanvasData();
            this.cropBoxData = cropper.getCropBoxData();
            this.update({
                cropped: true,
                cropping: false,
                previousUrl: data.url,
                url: cropper.getCroppedCanvas(data.type === 'image/png' ? {} : {
                    fillColor: '#fff',
                }).toDataURL(data.type),
            });
            cropper.clear();
        }
    }

    clear = () => {
        const { data } = this.state;
        if (data.cropping) {
            this.cropper.clear();
            this.update({
                cropping: false,
            });
        }
    }

    restore = () => {
        const { data } = this.state;
        if (data.cropped) {
            this.setState({
                ...this.state,
                data : {
                    ...this.state.data,
                    cropped: false,
                    previousUrl: '',
                    url: this.state.data.previousUrl
                }
            }, () => {
                    this.cropper.destroy();
                    this.cropper = null;
                    this.cropperSetup();
                }
            );
        }
    }

    reset = () => {
        this.stop();
        this.update({
            cropped: false,
            cropping: false,
            loaded: false,
            name: '',
            previousUrl: '',
            type: '',
            url: '',
        });
    }

    update = (updatedData) => {
        this.setState({
            ...this.state,
            data : {
                ...this.state.data,
                ...updatedData
            }
        }, () => {
            if(this.state.data.cropped) {
                this.cropper.destroy();
                this.cropper = null;
                this.cropperSetup();
            }
        });
    }

    updateCropper = () => {
        if(this.cropper)
            this.cropper.destroy();
        this.canvasData = null;
        this.cropBoxData = null;
        this.croppedData = null;
        this.cropper = null;
        this.cropperSetup();
    }

    editAction = (e) => {
        if(this.state.data.url!=='') {
            const { cropper } = this;
            let action = e.currentTarget.dataset.action; 
            switch (action) {
                case 'move':
                break;

                case 'crop':
                cropper.setDragMode(action);
                break;
    
                case 'zoom-in':
                cropper.zoom(0.1);
                break;
    
                case 'zoom-out':
                cropper.zoom(-0.1);
                break;
    
                case 'rotate-left':
                cropper.rotate(-90);
                break;
    
                case 'rotate-right':
                cropper.rotate(90);
                break;
    
                case 'flip-horizontal':
                cropper.scaleX(-cropper.getData().scaleX || -1);
                break;
    
                case 'flip-vertical':
                cropper.scaleY(-cropper.getData().scaleY || -1);
                break;
    
                default:
            }
        }
    }

    uplaodImage = () => {
        document.getElementsByClassName('image-loader')[0].click();
    }

    getBaseUrl = () =>  {
        var file    = document.getElementsByClassName('image-loader')[0]['files'][0];
        var reader  = new FileReader();
        var baseString;
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            baseString = e.target.result;
            this.setState ({
                data : {
                    cropped: false,
                    cropping: false,
                    loaded: false,
                    name: '',
                    previousUrl: '',
                    type: '',
                    url: baseString,
                }
            },()=>{
                this.updateCropper();            
            });
        }
    }

    render() {
        return (
        <div className = 'editor'>
            <div className="navbar">
                <nav className="nav">
                    {this.state.data.url!=='' && 
                    <a className="nav__button nav__button--success" title="Download" href= {this.state.data.url} download="edited_image.png"><span className="fa fa-download"></span></a> }
                    <button type="button" className="nav__button" data-action="restore" title="Undo (Ctrl + Z)" onClick={this.restore}><span className="fa fa-undo"></span></button>
                    <button type="button" className="nav__button nav__button--danger" data-action="clear" title="Cancel (Esc)" onClick={this.clear}><span className="fa fa-ban"></span></button>
                    <button type="button" className="nav__button nav__button--success" data-action="crop" title="OK (Enter)" onClick={this.crop}><span className="fa fa-check"></span></button>
                    <button type="button" className="nav__button nav__button--danger" data-action="remove" title="Delete (Delete)" onClick={this.reset}><span className="fa fa-trash"></span></button>
                </nav>
            </div>
            <input type="file" className="image-loader" onChange={this.getBaseUrl} style={{display:'none'}} ></input>
            <div className="canvas">
                <img className="image" src= {this.state.data.url} style={{height:'80%'}}/>
            </div>
            <div className="toolbar">
                <button className="toolbar__button" title="Load" onClick={this.uplaodImage}><span className="fa fa-upload"></span></button>
                <button className="toolbar__button" data-action="move" title="Move (M)" onClick={this.editAction}><span className="fa fa-arrows"></span></button>
                <button className="toolbar__button" data-action="crop" title="Crop (C)" onClick={this.editAction}><span className="fa fa-crop"></span></button>
                <button className="toolbar__button" data-action="zoom-in" title="Zoom In (I)" onClick={this.editAction}><span className="fa fa-search-plus"></span></button>
                <button className="toolbar__button" data-action="zoom-out" title="Zoom Out (O)" onClick={this.editAction}><span className="fa fa-search-minus"></span></button>
                <button className="toolbar__button" data-action="rotate-left" title="Rotate Left (L)" onClick={this.editAction}><span className="fa fa-rotate-left"></span></button>
                <button className="toolbar__button" data-action="rotate-right" title="Rotate Right (R)" onClick={this.editAction}><span className="fa fa-rotate-right"></span></button>
                <button className="toolbar__button" data-action="flip-horizontal" title="Flip Horizontal (H)" onClick={this.editAction}><span className="fa fa-arrows-h"></span></button>
                <button className="toolbar__button" data-action="flip-vertical" title="Flip Vertical (V)" onClick={this.editAction}><span className="fa fa-arrows-v"></span></button>
            </div>
        </div>
        );
    }
}

export default ImageEditor;