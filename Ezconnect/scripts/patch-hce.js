const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'node_modules', 'react-native-hce', 'android', 'build.gradle');

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace all instances of jcenter() with mavenCentral()
  content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
  fs.writeFileSync(file, content);
  console.log('Successfully patched react-native-hce to remove jcenter()');
} else {
  console.warn('react-native-hce android build.gradle not found, skipping patch.');
}
