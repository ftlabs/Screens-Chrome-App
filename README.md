# Screens Chrome App
A kiosk-enabled Chrome app for connecting as a viewer to the FT Labs Screens system.

## Build steps

1. Clone this repo
2. Install developer dependancies by running `npm install`
3. Once installation of dependencies is complete, run `npm run build`

## Building for test

1. Follow steps 1 - 2 of **Build Steps**
2. Once installation of dependencies is complete, run `npm run build-test`

## Testing build in Chrome

1. Build the Chrome app for either the test or build environments by following the above steps.
2. Go to the [Chrome Extensions Dashboard](chrome://extensions/) and enable the 'developer mode' with the toggle at the top (if not already enabled)
3. Click 'Load unpacked extension' and then navigate to the directory that contains the code for the `screens-chrome-app`. Select the `/build` folder in that directory and select 'OK'
4. The app should now appear in your list of extensions.
![image](https://cloud.githubusercontent.com/assets/913687/25135749/21aa6bfc-244b-11e7-9553-06740bfa4cb9.png)
5. Click 'launch' to start a local version of the app, and then navigate to the URL displayed on the screen to assign content to it.