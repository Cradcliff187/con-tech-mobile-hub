import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { subscriptionManager } from '@/services/SubscriptionManager';

interface SubscriptionErrorBoundaryProps {
  children: ReactNode;
  tableName?: string;
}

interface SubscriptionErrorState {
  hasSubscriptionError: boolean;
}

/**
 * Enhanced error boundary specifically for subscription-related errors
 * Provides graceful fallback and automatic subscription cleanup
 */
export class SubscriptionErrorBoundary extends Component<SubscriptionErrorBoundaryProps, SubscriptionErrorState> {
  public state: SubscriptionErrorState = {
    hasSubscriptionError: false
  };

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is a subscription-related error
    const isSubscriptionError = error.message.includes('subscription') || 
                               error.message.includes('channel') ||
                               error.message.includes('tried to subscribe multiple times');

    if (isSubscriptionError) {
      console.error('[SubscriptionErrorBoundary] Subscription error detected:', error);
      
      // Cleanup specific table subscription if tableName provided
      if (this.props.tableName) {
        console.log(`[SubscriptionErrorBoundary] Cleaning up ${this.props.tableName} subscription`);
        // Force cleanup the problematic subscription
        subscriptionManager.cleanup();
      }
      
      // Log subscription stats for debugging
      const stats = subscriptionManager.getStats();
      console.log('[SubscriptionErrorBoundary] Current subscription stats:', stats);
      
      if (this.props.tableName) {
        const subscriptionInfo = subscriptionManager.getSubscriptionInfo(this.props.tableName);
        console.log(`[SubscriptionErrorBoundary] ${this.props.tableName} subscription info:`, subscriptionInfo);
      }

      this.setState({ hasSubscriptionError: true });
    }
  }

  private handleReset = () => {
    this.setState({ hasSubscriptionError: false });
    // Force cleanup and restart
    subscriptionManager.cleanup();
  };

  public render() {
    if (this.state.hasSubscriptionError) {
      return (
        <ErrorBoundary onReset={this.handleReset}>
          {this.props.children}
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary>
        {this.props.children}
      </ErrorBoundary>
    );
  }
}