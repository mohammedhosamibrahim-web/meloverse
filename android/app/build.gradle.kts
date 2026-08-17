plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.meloverse.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.meloverse.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 8
        versionName = "0.7.0"
        resourceConfigurations += listOf("ar", "en")
        buildConfigField("String", "SERVER_URL", "\"https://msgid-tracker-shelter-disclosure.trycloudflare.com\"")
    }

    signingConfigs {
        create("release") {
            storeFile = file("../keystore/meloverse.jks")
            storePassword = System.getenv("MV_KEYSTORE_PASS") ?: "meloverse2026"
            keyAlias = "meloverse"
            keyPassword = System.getenv("MV_KEYSTORE_PASS") ?: "meloverse2026"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.coil.compose)
}
