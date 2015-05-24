package com.example.zootypers.core;

/**
 * Created by wlam on 5/23/15.
 */
public class WordModel {

    private String mWordString;

    public WordModel(String word) {
        mWordString = word;
    }

    public String getWordString() {
        return mWordString;
    }

    public void setWordString(String wordString) {
        this.mWordString = wordString;
    }
}
