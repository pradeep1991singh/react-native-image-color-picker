import React, { Component } from 'react';
import { Platform } from 'react-native'
import { WebView } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';
import RNImageColorPicker from 'image-color-picker';
import { ImageCacheManager } from 'react-native-cached-image';
import { canvasHtml } from './canvas-html';

async function getColor(imagePath) {
  return RNImageColorPicker.getColor(imagePath)
}

export default class ImageColorPicker extends Component {
  state = {
    imageBlob: ''
  };

  componentDidMount() {
    if (this.props.imageUrl)
      this.getImage(this.props.imageUrl);
  }

  getImage = async imageUrl => {
    try {

      let imageCacheManager = ImageCacheManager({});
      let localImagePath = await imageCacheManager.downloadAndCacheUrl(imageUrl, {});

      // if we are on Android, then use native for Android
      if (Platform.OS === 'android') {
        let colors = [];
        const color = await getColor(localImagePath);
        color.forEach(c => {
          colors.push(c.split('-'));
        });
        this.imageColorPickerView.props.onMessage({
          promise: JSON.stringify({ 'message': 'imageColorPicker', 'payload': colors })
        });
        return;
      }

      const base64EncodedImage = await RNFetchBlob.fs.readFile(
        localImagePath,
        'base64'
      );
      this.setState({ imageBlob: base64EncodedImage });
    } catch (error) {
      this.props.pickerCallback(error);
    }
  };

  render() {
    const { pickerCallback, pickerStyle } = this.props;

    return (
      <WebView
        originWhitelist={['*']}
        ref={imageColorPickerView => (this.imageColorPickerView = imageColorPickerView)}
        source={{ html: canvasHtml(this.state.imageBlob, this.props) }}
        javaScriptEnabled={true}
        onMessage={event => { pickerCallback(event); } }
        style={pickerStyle}
      />
    );
  }
}
