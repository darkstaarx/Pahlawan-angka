plugins {
    alias(libs.plugins.android.application)
}

android {
    // Watch Face Format packages are resource-only: no Kotlin/Java code at all.
    enableKotlin = false
    namespace = "com.malaysiapixel.lite"
    compileSdk = 36

    defaultConfig {
        // Change applicationId before publishing; it must be unique on Google Play.
        applicationId = "com.malaysiapixel.lite"
        // WFF version 1 (declared in AndroidManifest.xml) needs Wear OS 4 / API 33.
        minSdk = 33
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        debug {
            isMinifyEnabled = true
        }
        release {
            isMinifyEnabled = true
            // Must stay false: the drawables and font are referenced only by name from
            // res/raw/watchface.xml, so the resource shrinker would delete them.
            isShrinkResources = false
            // Local testing only. Configure your own upload key before any publishing.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}
