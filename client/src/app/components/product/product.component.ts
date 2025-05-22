import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoaderComponent } from '../loader/loader.component';
import { FormsModule } from "@angular/forms";
import { ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  productId: string = '';
  product: any = null;
  loading = true;
  error = '';
  lastMessageCount = 0;

  chatInput: string = '';
  messages: { query: string; response: string }[] = [];
  chatLoading = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchProductDetails();
  }



  fetchProductDetails() {
    this.loading = true;
    this.http.get<any>(`/api/product/${this.productId}`,
      { headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } }
    )
      .subscribe({
        next: (response) => {
          this.product = response;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load product details';
          this.loading = false;
          console.error('Error fetching product:', err);
        }
      });
  }

  getSentimentPercentage(type: 'positive' | 'neutral' | 'negative'): number {
    if (!this.product?.summary_details) return 0;
    const total = this.product.summary_details.review_count || 1;
    return Math.round((this.product.sentiment_details[type] / total) * 100);
  }

  getRatingPercentage(): number {
    if (!this.product?.product_details?.rating) return 0;
    const rating = parseFloat(this.product.product_details.rating.split(' ')[0]);
    return (rating / 5) * 100;
  }



  sendQuery() {
    const query = this.chatInput.trim();
    if (!query || this.chatLoading) return;

    const payload = {
      product_id: this.productId,
      query: query
    };

    // Push user message immediately with loading state
    this.messages.push({ query, response: 'Loading...' });
    this.chatInput = '';
    this.chatLoading = true;

    this.http.post<any>('/api/query', payload, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (res) => {
        this.messages[this.messages.length - 1].response = res;
        this.chatLoading = false;
      },
      error: (err) => {
        console.error('Query failed:', err);
        this.messages[this.messages.length - 1].response = 'Sorry, something went wrong.';
        this.chatLoading = false;
      }
    });

  }

  ngAfterViewChecked() {
    if (this.messages.length !== this.lastMessageCount) {
      this.scrollChatToBottom();
      this.lastMessageCount = this.messages.length;
    }
  }

  private scrollChatToBottom() {
    if (this.chatContainer && this.chatContainer.nativeElement) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }
}