import { Component, OnInit, HostListener } from '@angular/core';
import { interval, Subscription, catchError } from 'rxjs';
import { ApiService, Entry } from '../api-service.service';
@Component({
  selector: 'app-tweet-feedyb',
  templateUrl: './tweetfeedyb.component.html',
  styleUrls: ['./tweetfeedyb.component.css']
})
export class TweetfeedybComponent implements OnInit {
  // tweets: Tweet[] = [];
  updateSubscription!: Subscription; // Use non-null assertion


  private lastFetchedId: number = 0;
  tweets: Entry[] = [];

  loadingError: string | null = null;

  constructor(private apiService: ApiService) { }


  ngOnInit() {
    this.fetchLatestTweets();
    this.startAutoUpdate();
  }

  ngOnDestroy() {
    this.stopAutoUpdate();
  }


  private fetchLatestTweets() {
    const limit = 10; // Number of latest tweets to fetch
    // this.tweets = this.apiService.fetchWithLimit(limit);
    // Assuming fetchTweets returns an array of tweets in descending order
    // Fetch the latest 10 tweets
    var latestTweets = this.apiService.fetchWithDirectionId(10, Number.MAX_SAFE_INTEGER, -1);

    // Filter out any tweets with IDs that are already in the 'tweets' array
    var newTweets = latestTweets.filter(tweet => !this.tweets.some(existingTweet => existingTweet.id === tweet.id));

    // Add the new unique tweets to the 'tweets' array at the beginning
    this.tweets.unshift(...newTweets);
  }

  //Auto-Update Tweets Every Second:
  private startAutoUpdate() {
    this.updateSubscription = interval(1000).subscribe(() => {
      this.fetchLatestTweets();
    });
  }

  private stopAutoUpdate() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }


  // @HostListener('window:scroll', [])
  // onScroll(): void {
  //   const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  //   if (scrollTop > 0) {
  //     // Stop Auto-Updates on Scroll Down:
  //     this.stopAutoUpdate();
  //   } else {
  //       // Resume Auto-Updates on Scroll Up
  //     this.startAutoUpdate();
  //   }
  // }
  //Resume Auto-Updates on Scroll Up
  onScroll() {
    if (window.scrollY === 0) {
      this.startAutoUpdate();
    } else {
      this.stopAutoUpdate();
    }
  }
  //There should be no skipped or missed tweets on the page
  private fetchskippedTweets() {
    // Get the latest tweets starting from the last fetched ID + 1
    var newTweets = this.apiService.fetchWithDirectionId(10, this.lastFetchedId + 1, 1);

    if (newTweets.length > 0) {
      // Update the last fetched ID with the highest fetched tweet's ID
      this.lastFetchedId = newTweets[0].id;

      // Add the new tweets at the top of the 'tweets' array
      this.tweets.unshift(...newTweets);
    }
  }
  //	In case of any failure conditions the tweet updates a retry should be made, but no error messages should be visible to the user
  private retryAttempts: number = 3;
  private retryDelay: number = 5000; // Delay in milliseconds

  private async fetchretryAttemptTweets() {
    for (var attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        // Get the latest tweets starting from the last fetched ID + 1
        var newTweets = this.apiService.fetchWithDirectionId(10, this.lastFetchedId + 1, 1);

        if (newTweets.length > 0) {
          // Update the last fetched ID with the highest fetched tweet's ID
          this.lastFetchedId = newTweets[0].id;

          // Add the new tweets at the top of the 'tweets' array
          this.tweets.unshift(...newTweets);
        }

        // Exit the retry loop if fetch was successful
        break;
      } catch (error) {
        // Retry after a delay if an error occurs
        if (attempt < this.retryAttempts - 1) {
          await this.delay(this.retryDelay);
        }
      }
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
