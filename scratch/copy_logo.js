import fs from 'node:fs'
import path from 'node:path'

const source = 'C:\\Users\\shubham uprade\\.gemini\\antigravity-ide\\brain\\b588ccf4-c027-48dd-8cf7-bd0fd864df9b\\.user_uploaded\\media_1792730580719.png'
const target1 = 'c:\\Users\\shubham uprade\\OneDrive\\Desktop\\startup\\src\\assets\\vyntra-logo.png'
const target2 = 'c:\\Users\\shubham uprade\\OneDrive\\Desktop\\startup\\public\\vyntra-logo.png'

fs.copyFileSync(source, target1)
fs.copyFileSync(source, target2)
console.log('Logo copied successfully to src/assets/vyntra-logo.png and public/vyntra-logo.png')
