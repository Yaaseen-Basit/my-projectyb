
import sentences from '../sentences';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';


const MAX_DB_ENTRIES = 100000;

enum INITIAL_ENTRIES {
  FEW = 5,
  MANY = 100
}

const PREPEND_IDS = false;

export interface Entry {
  image: string;
  id: number;
  text: string;
  username: string;
  timeStamp: number;
  comments?: string[];
}

@Injectable({
  providedIn: 'root'
})
//PersistentServer
export class ApiService {
  private entries: Entry[] = [];
  private updateFrequency: number = 1000 / 10;
  private lastSuccessfulFetch: number = Date.now();
  private lastId: number = 1;
  private lastEntryTimeStamp?: number;

  constructor() {
    this.reset();
  }

  reset(): { success: boolean } {
    this.entries = [];
    this.lastSuccessfulFetch = Date.now();
    this.lastId = 1;
    this.lastEntryTimeStamp = undefined;
    this.addEntriesToDatabase(INITIAL_ENTRIES.MANY);

    return {
      success: true
    };
  }

  fetchWithDirectionId(limit: number, id: number, direction: number = 1): Entry[] {
    this.updateDatabaseWithTimePassage();
    return this.fetchWithIdAndLimit(this.entries, id, limit, direction);
  }

  fetchWithDirectionTimestamp(limit: number, timeStamp: number, direction: number = 1): Entry[] {
    this.updateDatabaseWithTimePassage();
    return this.fetchWithTimeStampAndLimit(this.entries, timeStamp, limit, direction);
  }

  fetchWithLimit(limit: number): Entry[] {
    this.updateDatabaseWithTimePassage();
    return this.entries.slice(0, limit);
  }

  setUpdateFrequency(frequency: number): void {
    this.updateFrequency = 1000 / frequency;
  }

  getComments(tweetId: number): Observable<string[] | { success: boolean, message: string }> {
    const tweet = this.entries.find((tweet) => tweet.id === tweetId);

    if (!tweet) {
      return of({
        success: false,
        message: "No tweet found with the given id."
      });
    }

    if (!tweet.comments) {
      tweet.comments = this.getCommentsArray();
    }

    return of(tweet.comments);
  }

  putComment(tweetId: number, comment: string): Observable<string[] | { success: boolean, message: string }> {
    const tweet = this.entries.find((tweet) => tweet.id === tweetId);

    if (!tweet) {
      return of({
        success: false,
        message: "No tweet found with the given id."
      });
    }

    const trimmed = comment.substr(0, 1000);

    if (!tweet.comments) {
      tweet.comments = this.getCommentsArray();
    }

    tweet.comments.push(trimmed);

    return of(tweet.comments);
  }

  private updateDatabaseWithTimePassage() {
    const now = Date.now();
    const timeWaited = now - this.lastSuccessfulFetch;
    const approxEntriesAdded = Math.floor(timeWaited / this.updateFrequency);

    if (approxEntriesAdded > 0) {
      this.lastSuccessfulFetch = now;
      this.addEntriesToDatabase(approxEntriesAdded);
    }
  }

  private addEntriesToDatabase(entries: number) {
    if (!this.lastEntryTimeStamp) {
      this.lastEntryTimeStamp = Date.now() - 1000 * this.updateFrequency;
    }

    const currentTime = Date.now();
    const diffFromLastEntry = currentTime - this.lastEntryTimeStamp;

    const steps = Math.ceil(diffFromLastEntry / entries);

    for (let i = 0; i < entries; i++) {
      if (this.entries.length > MAX_DB_ENTRIES) {
        return;
      }

      const entryTime = Math.min(
        currentTime,
        this.lastEntryTimeStamp + steps * Math.random()
      );

      this.lastEntryTimeStamp = entryTime;

      this.putDatabaseRow(Math.floor(entryTime));
    }
  }

  private putDatabaseRow(timeStamp: number) {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];

    this.entries.unshift({
      image: `https://i.pravatar.cc/300?u=${this.lastId}`,
      id: this.lastId,
      text: PREPEND_IDS ? `${this.lastId}. ${sentence}` : sentence,
      username: `Person ${Math.round(1 + Math.random() * 100)}`,
      timeStamp
    });

    this.lastId++;
  }

  private getCommentsArray(): string[] {
    const commentsToPopulate = Math.max(2, Math.ceil(Math.random() * 20));
    const comments: string[] = [];

    for (let i = 0; i <= commentsToPopulate; i++) {
      comments.push(sentences[Math.floor(Math.random() * sentences.length)]);
    }

    return comments;
  }

  private fetchWithIdAndLimit(entries: Entry[], id: number, limit: number, direction: number): Entry[] {
    return this.sliceEntries(
      entries.filter((entry) => {
        if (direction === 1) {
          return entry.id > id;
        } else {
          return entry.id < id;
        }
      }),
      limit,
      direction
    );
  }

  private fetchWithTimeStampAndLimit(entries: Entry[], timeStamp: number, limit: number, direction: number): Entry[] {
    return this.sliceEntries(
      entries.filter((entry) => {
        if (direction === 1) {
          return entry.timeStamp > timeStamp;
        } else {
          return entry.timeStamp < timeStamp;
        }
      }),
      limit,
      direction
    );
  }

  private sliceEntries(entries: Entry[], limit: number, direction: number): Entry[] {
    if (direction === 1) {
      return entries.slice(Math.max(0, entries.length - limit), entries.length);
    }

    return entries.slice(0, limit);
  }
}

