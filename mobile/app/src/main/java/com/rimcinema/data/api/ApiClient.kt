package com.rimcinema.data.api

import com.rimcinema.util.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // For Android emulator use 10.0.2.2, for real device use your PC's local IP
    private const val BASE_URL = "http://10.0.2.2:8080/api/"

    private var retrofit: Retrofit? = null
    private var sessionManager: SessionManager? = null

    fun init(sessionManager: SessionManager) {
        this.sessionManager = sessionManager
    }

    private fun getClient(): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor { chain ->
                val original = chain.request()
                val builder = original.newBuilder()
                sessionManager?.getToken()?.let { token ->
                    builder.header("Authorization", "Bearer $token")
                }
                chain.proceed(builder.build())
            }
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    private fun getRetrofit(): Retrofit {
        if (retrofit == null) {
            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(getClient())
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!
    }

    val authApi: AuthApi by lazy { getRetrofit().create(AuthApi::class.java) }
    val movieApi: MovieApi by lazy { getRetrofit().create(MovieApi::class.java) }

    fun getStreamUrl(movieId: Long): String = "${BASE_URL}stream/$movieId/master.m3u8"
}
