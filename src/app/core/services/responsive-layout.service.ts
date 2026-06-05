import { Injectable, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface LayoutConfig {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  gridColumns: number;
  headerHeight: string;
  containerPadding: string;
}

/**
 * Service for managing responsive layouts using Angular CDK Breakpoints
 * 
 * Breakpoints:
 * - Desktop: >1200px
 * - Tablet: 768px–1200px
 * - Mobile: <768px
 */
@Injectable({
  providedIn: 'root'
})
export class ResponsiveLayoutService {
  private breakpointObserver = inject(BreakpointObserver);

  // Custom breakpoint constants
  private readonly CUSTOM_BREAKPOINTS = {
    mobile: '(max-width: 767.98px)',
    tablet: '(min-width: 768px) and (max-width: 1199.98px)',
    desktop: '(min-width: 1200px)'
  };

  // Observable that emits current device type
  private deviceType$ = this.breakpointObserver.observe([
    this.CUSTOM_BREAKPOINTS.mobile,
    this.CUSTOM_BREAKPOINTS.tablet,
    this.CUSTOM_BREAKPOINTS.desktop
  ]).pipe(
    map(result => {
      if (result.breakpoints[this.CUSTOM_BREAKPOINTS.mobile]) {
        return 'mobile' as DeviceType;
      } else if (result.breakpoints[this.CUSTOM_BREAKPOINTS.tablet]) {
        return 'tablet' as DeviceType;
      } else {
        return 'desktop' as DeviceType;
      }
    })
  );

  // Convert to signal for reactive composition
  deviceType = toSignal(this.deviceType$, { initialValue: 'desktop' as DeviceType });

  // Convenience signals
  isMobile = signal(false);
  isTablet = signal(false);
  isDesktop = signal(true);

  // Layout configuration signal
  layoutConfig = signal<LayoutConfig>({
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    gridColumns: 4,
    headerHeight: '64px',
    containerPadding: '24px'
  });

  constructor() {
    // Subscribe to device type changes and update signals
    this.deviceType$.subscribe(deviceType => {
      const isMobile = deviceType === 'mobile';
      const isTablet = deviceType === 'tablet';
      const isDesktop = deviceType === 'desktop';

      this.isMobile.set(isMobile);
      this.isTablet.set(isTablet);
      this.isDesktop.set(isDesktop);

      // Update layout configuration based on device type
      const config: LayoutConfig = {
        deviceType,
        isMobile,
        isTablet,
        isDesktop,
        gridColumns: this.getGridColumns(deviceType),
        headerHeight: this.getHeaderHeight(deviceType),
        containerPadding: this.getContainerPadding(deviceType)
      };

      this.layoutConfig.set(config);
    });
  }

  /**
   * Get grid columns based on device type
   */
  private getGridColumns(deviceType: DeviceType): number {
    switch (deviceType) {
      case 'mobile':
        return 1;
      case 'tablet':
        return 2;
      case 'desktop':
        return 4;
    }
  }

  /**
   * Get header height based on device type
   */
  private getHeaderHeight(deviceType: DeviceType): string {
    switch (deviceType) {
      case 'mobile':
        return '56px';
      case 'tablet':
        return '60px';
      case 'desktop':
        return '64px';
    }
  }

  /**
   * Get container padding based on device type
   */
  private getContainerPadding(deviceType: DeviceType): string {
    switch (deviceType) {
      case 'mobile':
        return '12px';
      case 'tablet':
        return '16px';
      case 'desktop':
        return '24px';
    }
  }

  /**
   * Check if current device matches specific breakpoint
   */
  isBreakpoint(breakpoint: DeviceType): boolean {
    return this.deviceType() === breakpoint;
  }

  /**
   * Get responsive grid columns for specific content type
   */
  getRecipeGridColumns(): number {
    const deviceType = this.deviceType();
    switch (deviceType) {
      case 'mobile':
        return 1;
      case 'tablet':
        return 2;
      case 'desktop':
        return 3; // Changed from 4 to 3 for better card sizing
    }
  }

  /**
   * Get responsive grid gap
   */
  getGridGap(): string {
    const deviceType = this.deviceType();
    switch (deviceType) {
      case 'mobile':
        return '12px';
      case 'tablet':
        return '16px';
      case 'desktop':
        return '24px';
    }
  }

  /**
   * Get responsive card height
   */
  getCardImageHeight(): string {
    const deviceType = this.deviceType();
    switch (deviceType) {
      case 'mobile':
        return '180px';
      case 'tablet':
        return '200px';
      case 'desktop':
        return '220px';
    }
  }

  /**
   * Check if device is mobile or tablet (smaller screens)
   */
  isSmallScreen(): boolean {
    return this.isMobile() || this.isTablet();
  }

  /**
   * Get responsive font size
   */
  getFontSize(base: number): string {
    const deviceType = this.deviceType();
    switch (deviceType) {
      case 'mobile':
        return `${base * 0.875}rem`; // 87.5%
      case 'tablet':
        return `${base * 0.9375}rem`; // 93.75%
      case 'desktop':
        return `${base}rem`;
    }
  }
}
